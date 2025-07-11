package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.*;
import com.eazybytes.event.CartEventProducer;
import com.eazybytes.event.model.CheckoutFailedEvent;
import com.eazybytes.event.model.CheckoutInitiatedEvent;
import com.eazybytes.event.model.OrderCompletedEvent;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;
import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import com.eazybytes.repository.CartRedisRepository;
import com.eazybytes.repository.CartRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CartServiceImpl implements CartService {

    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    private final CartEventProducer cartEventProducer;
    private final InventoryClient inventoryClient;
    private final CircuitBreakerFactory<?, ?> cbFactory;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 50;

    public CartServiceImpl(CartEventProducer cartEventProducer, InventoryClient inventoryClient, CircuitBreakerFactory<?, ?> cbFactory) {
        this.cartEventProducer = cartEventProducer;
        this.inventoryClient = inventoryClient;
        this.cbFactory = cbFactory;
    }

    @Override
    @Transactional
    public CartResponse getCartByUserId(String userId) throws CartNotFoundException {
        log.info("Fetching cart for user: {}", userId);

        // Check Redis cache
        Cart cart = cartRedisRepository.findByUserId(userId);
        if (cart != null) {
            try {
                Hibernate.initialize(cart.getItems());
                log.debug("Cached cart for user {} has {} items", userId, cart.getItems().size());
                if (cart.getItems() == null || cart.getItems().isEmpty()) {
                    log.warn("Cached cart for user {} has empty or uninitialized items. Invalidating cache and fetching from DB.", userId);
                    cartRedisRepository.delete(userId);
                } else {
                    return toCartResponse(cart);
                }
            } catch (Exception e) {
                log.warn("Error accessing cached cart for user: {}. Invalidating cache and fetching from DB.", userId, e);
                cartRedisRepository.delete(userId);
            }
        }

        // Fetch from database
        log.debug("Fetching cart from DB for user: {}", userId);
        cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        Hibernate.initialize(cart.getItems());
        log.debug("Cart fetched from DB for user {} has {} items", userId, cart.getItems() != null ? cart.getItems().size() : 0);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            log.warn("Cart for user {} has no items. Verifying database data.", userId);
            logDatabaseItems(userId, cart.getId());
        }

        cartRedisRepository.save(userId, cart);
        log.debug("Cart cached in Redis for user: {}", userId);
        return toCartResponse(cart);
    }

    private void logDatabaseItems(String userId, int cartId) {
        try {
            Optional<Cart> dbCart = cartRepository.findByUserId(userId);
            if (dbCart.isPresent()) {
                List<CartItems> items = dbCart.get().getItems();
                log.info("Database check for user {} (cart ID {}): {} items found", userId, cartId, items.size());
                items.forEach(item -> log.info("Item: productId={}, color={}, quantity={}",
                        item.getProductId(), item.getColor(), item.getQuantity()));
            } else {
                log.warn("No cart found in database for user {}", userId);
            }
        } catch (Exception e) {
            log.error("Error checking database items for user {}: {}", userId, e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(String userId, CartItemRequest cartItemRequest) throws CartNotFoundException, InvalidItemException {
        int attempt = 0;
        while (true) {
            try {
                log.info("Attempt {} to add item {} for user: {}", attempt + 1, cartItemRequest.getProductId(), userId);
                Cart cart = getCartForUpdate(userId);
                Hibernate.initialize(cart.getItems());

                // Normalize color
                String normalizedColor = normalizeColor(cartItemRequest.getColor());

                CartItems cartItemToAdd = new CartItems();
                cartItemToAdd.setProductId(cartItemRequest.getProductId());
                cartItemToAdd.setQuantity(cartItemRequest.getQuantity());
                cartItemToAdd.setColor(normalizedColor);

                InventoryDto inventory = checkInventoryWithCircuitBreaker(cartItemToAdd.getProductId(), normalizedColor);
                cartItemToAdd.setProductName(inventory.getProductName());
                cartItemToAdd.setPrice(inventory.getCurrentPrice());

                Optional<CartItems> existingItemOpt = cart.getItems().stream()
                        .filter(item -> item.getProductId().equals(cartItemToAdd.getProductId()) &&
                                normalizeColor(item.getColor()).equals(normalizedColor))
                        .findFirst();

                int currentQuantityInCart = existingItemOpt.map(CartItems::getQuantity).orElse(0);
                int requestedTotalQuantity = currentQuantityInCart + cartItemToAdd.getQuantity();

                if (requestedTotalQuantity > inventory.getQuantity()) {
                    throw new InvalidItemException("Insufficient inventory for " + cartItemToAdd.getProductId() + ", color: " + normalizedColor +
                            ". Available: " + inventory.getQuantity() + ", requested total: " + requestedTotalQuantity);
                }

                if (existingItemOpt.isPresent()) {
                    existingItemOpt.get().setQuantity(requestedTotalQuantity);
                } else {
                    cartItemToAdd.setCart(cart);
                    cart.getItems().add(cartItemToAdd);
                }
                cart.setTotalPrice(calculateTotalPrice(cart));

                Cart savedCart = cartRepository.save(cart);
                Hibernate.initialize(savedCart.getItems());
                cartRedisRepository.save(userId, savedCart);
                log.info("Item added/updated in DB and Redis for user: {} on attempt {}", userId, attempt + 1);
                return toCartResponse(savedCart);

            } catch (OptimisticLockingFailureException e) {
                attempt++;
                log.warn("Optimistic lock failed on attempt {} for user {}. Retrying...", attempt, userId);
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    log.error("Max retry attempts ({}) reached for user {}. Invalidating cache.", MAX_RETRY_ATTEMPTS, userId);
                    cartRedisRepository.delete(userId);
                    throw new RuntimeException("Failed to add item due to concurrent modifications. Please try again.", e);
                }
                sleepBeforeRetry();
            } catch (Exception ex) {
                log.error("Error adding item for user {}: {}", userId, ex.getMessage(), ex);
                throw ex;
            }
        }
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException, InvalidItemException {
        int attempt = 0;
        while (true) {
            try {
                // Normalize color
                String normalizedColor = normalizeColor(color);

                log.info("Attempt {} to update item {} (color: {}) to quantity {} for user: {}", attempt + 1, productId, normalizedColor, quantity, userId);
                Cart cart = getCartForUpdate(userId);
                Hibernate.initialize(cart.getItems());

                InventoryDto inventory = checkInventoryWithCircuitBreaker(productId, normalizedColor);
                if (quantity > inventory.getQuantity()) {
                    throw new InvalidItemException("Insufficient inventory for " + productId + ", color: " + normalizedColor +
                            ". Available: " + inventory.getQuantity() + ", requested: " + quantity);
                }

                Optional<CartItems> itemOpt = cart.getItems().stream()
                        .filter(item -> item.getProductId().equals(productId) &&
                                normalizeColor(item.getColor()).equals(normalizedColor))
                        .findFirst();

                if (itemOpt.isPresent()) {
                    CartItems item = itemOpt.get();
                    if (quantity <= 0) {
                        cart.getItems().remove(item);
                        log.info("Item {} (color: {}) removed due to quantity <= 0 for user {}", productId, normalizedColor, userId);
                    } else {
                        item.setQuantity(quantity);
                        log.info("Item {} (color: {}) quantity updated to {} for user {}", productId, normalizedColor, quantity, userId);
                    }
                }
                cart.setTotalPrice(calculateTotalPrice(cart));

                Cart savedCart = cartRepository.save(cart);
                Hibernate.initialize(savedCart.getItems());
                cartRedisRepository.save(userId, savedCart);
                log.info("Cart item updated in DB and Redis for user: {} on attempt {}", userId, attempt + 1);
                return toCartResponse(savedCart);

            } catch (OptimisticLockingFailureException e) {
                attempt++;
                log.warn("Optimistic lock failed on attempt {} for user {}. Retrying...", attempt, userId);
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    log.error("Max retry attempts ({}) reached for user {}. Invalidating cache.", MAX_RETRY_ATTEMPTS, userId);
                    cartRedisRepository.delete(userId);
                    throw new RuntimeException("Failed to update item due to concurrent modifications. Please try again.", e);
                }
                sleepBeforeRetry();
            } catch (Exception ex) {
                log.error("Error updating item for user {}: {}", userId, ex.getMessage(), ex);
                throw ex;
            }
        }
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(String userId, String productId, String color) throws CartNotFoundException {
        int attempt = 0;
        while (true) {
            try {
                // Normalize color
                String normalizedColor = normalizeColor(color);

                log.info("Attempt {} to remove item {} (color: {}) for user: {}", attempt + 1, productId, normalizedColor, userId);
                Cart cart = getCartForUpdate(userId);
                Hibernate.initialize(cart.getItems());

                boolean removed = cart.getItems().removeIf(item ->
                        item.getProductId().equals(productId) &&
                        normalizeColor(item.getColor()).equals(normalizedColor));

                if (!removed) {
                    log.warn("Attempted to remove item {} (color: {}) not found in cart for user {}", productId, normalizedColor, userId);
                    cartRedisRepository.save(userId, cart);
                    return toCartResponse(cart);
                }
                cart.setTotalPrice(calculateTotalPrice(cart));

                Cart savedCart = cartRepository.save(cart);
                Hibernate.initialize(savedCart.getItems());
                cartRedisRepository.save(userId, savedCart);
                log.info("Item removed from DB and Redis for user: {} on attempt {}", userId, attempt + 1);
                return toCartResponse(savedCart);

            } catch (OptimisticLockingFailureException e) {
                attempt++;
                log.warn("Optimistic lock failed on attempt {} for user {}. Retrying...", attempt, userId);
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    log.error("Max retry attempts ({}) reached for user {}. Invalidating cache.", MAX_RETRY_ATTEMPTS, userId);
                    cartRedisRepository.delete(userId);
                    throw new RuntimeException("Failed to remove item due to concurrent modifications. Please try again.", e);
                }
                sleepBeforeRetry();
            } catch (Exception ex) {
                log.error("Error removing item for user {}: {}", userId, ex.getMessage(), ex);
                throw ex;
            }
        }
    }

    @Override
    @Transactional
    public CartResponse mergeListItemToCart(String userId, List<CartItemRequest> guestCartItems) throws CartNotFoundException {
        if (guestCartItems == null || guestCartItems.isEmpty()) {
            log.info("Guest cart is empty. No items to merge for user: {}", userId);
            return getCartByUserId(userId);
        }

        log.info("Merging {} guest cart items for user: {}", guestCartItems.size(), userId);
        CartResponse result = null;

        // Get current user cart
        CartResponse currentCart = getCartByUserId(userId);

        // Process each item in the guest cart
        for (CartItemRequest item : guestCartItems) {
            try {
                // Normalize color
                String normalizedColor = normalizeColor(item.getColor());

                log.debug("Processing guest cart item: {} ({}) x{}", item.getProductId(), normalizedColor, item.getQuantity());

                // Validate item inventory before adding
                InventoryDto inventory = checkInventoryWithCircuitBreaker(item.getProductId(), normalizedColor);
                if (inventory == null || inventory.getQuantity() <= 0) {
                    log.warn("Skipping item due to no inventory: {} ({})", item.getProductId(), normalizedColor);
                    continue;
                }

                // Check if product already exists in cart
                boolean itemExists = false;
                for (CartItemResponse existingItem : currentCart.getItems()) {
                    if (existingItem.getProductId().equals(item.getProductId()) &&
                        normalizeColor(existingItem.getColor()).equals(normalizedColor)) {
                        // Product exists, update quantity
                        int newQuantity = existingItem.getQuantity() + item.getQuantity();

                        // Check inventory quantity
                        if (newQuantity > inventory.getQuantity()) {
                            log.warn("Cannot update item quantity due to insufficient inventory: {} ({}), requested: {}, available: {}",
                                    item.getProductId(), normalizedColor, newQuantity, inventory.getQuantity());
                            continue;
                        }

                        // Update quantity for existing product
                        result = updateCartItem(userId, item.getProductId(), newQuantity, normalizedColor);
                        log.debug("Updated item quantity in cart: {} ({}) x{}",
                                item.getProductId(), normalizedColor, newQuantity);
                        itemExists = true;
                        break;
                    }
                }

                // If product doesn't exist, add new
                if (!itemExists) {
                    if (item.getQuantity() > inventory.getQuantity()) {
                        log.warn("Skipping item due to insufficient inventory: {} ({}), requested: {}, available: {}",
                                item.getProductId(), normalizedColor, item.getQuantity(), inventory.getQuantity());
                        continue;
                    }

                    // Create new CartItemRequest with normalized color
                    CartItemRequest normalizedItem = new CartItemRequest(
                            item.getProductId(),
                            item.getQuantity(),
                            normalizedColor
                    );

                    // Add new product to cart
                    result = addItemToCart(userId, normalizedItem);
                    log.debug("Successfully added item to cart: {} ({}) x{}",
                            item.getProductId(), normalizedColor, item.getQuantity());
                }
            } catch (InvalidItemException e) {
                log.warn("Skipping invalid item during merge: {} ({}). Reason: {}",
                        item.getProductId(), item.getColor(), e.getMessage());
            } catch (Exception e) {
                log.error("Error processing item {} ({}) during merge for user {}. Reason: {}",
                        item.getProductId(), item.getColor(), userId, e.getMessage(), e);
            }
        }

        // Invalidate Redis cache to ensure next fetch gets fresh data
        cartRedisRepository.delete(userId);
        log.info("Invalidated Redis cache for user: {} after cart merge to ensure data consistency", userId);

        // Return final cart state from database
        return getCartByUserId(userId);
    }

    @Override
    @Transactional
    public void clearCart(String userId) throws CartNotFoundException {
        int attempt = 0;
        while (true) {
            try {
                log.info("Attempt {} to clear cart for user: {}", attempt + 1, userId);
                Cart cart = getCartForUpdate(userId);
                Hibernate.initialize(cart.getItems());

                if (cart.getItems().isEmpty()) {
                    log.info("Cart already empty for user {}. No action needed.", userId);
                    cartRedisRepository.delete(userId);
                    return;
                }
                cart.getItems().clear();
                cart.setTotalPrice(0);

                cartRepository.save(cart);
                cartRedisRepository.delete(userId);
                log.info("Cart cleared in DB and deleted from Redis for user: {} on attempt {}", userId, attempt + 1);
                return;

            } catch (OptimisticLockingFailureException e) {
                attempt++;
                log.warn("Optimistic lock failed on attempt {} for user {}. Retrying...", attempt, userId);
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    log.error("Max retry attempts ({}) reached for user {}. Invalidating cache.", MAX_RETRY_ATTEMPTS, userId);
                    cartRedisRepository.delete(userId);
                    throw new RuntimeException("Failed to clear cart due to concurrent modifications. Please try again.", e);
                }
                sleepBeforeRetry();
            } catch (Exception ex) {
                log.error("Error clearing cart for user {}: {}", userId, ex.getMessage(), ex);
                throw ex;
            }
        }
    }

    @Override
    @Transactional
    public SagaInitiationResponse initiateCheckoutSaga(CheckoutRequest checkoutRequest, List<CartItemIdentifier> selectedItems) throws CartNotFoundException, InvalidItemException {
        String userId = checkoutRequest.getUserId();
        log.info("Initiating checkout saga for user: {}", userId);
        Cart cart = getCartForUpdate(userId);
        Hibernate.initialize(cart.getItems());

        List<CartItems> itemsToCheckout = cart.getItems();
        if (selectedItems != null && !selectedItems.isEmpty()) {
            // Normalize colors in selectedItems before comparison
            List<CartItemIdentifier> normalizedSelectedItems = selectedItems.stream()
                    .map(item -> new CartItemIdentifier(item.getProductId(), normalizeColor(item.getColor())))
                    .collect(Collectors.toList());

            itemsToCheckout = cart.getItems().stream()
                    .filter(item -> normalizedSelectedItems.stream()
                            .anyMatch(sel -> sel.getProductId().equals(item.getProductId()) &&
                                    normalizeColor(item.getColor()).equals(sel.getColor())))
                    .collect(Collectors.toList());
            if (itemsToCheckout.isEmpty()) {
                throw new InvalidItemException("No valid items selected for checkout");
            }
            log.info("Checking out selected items for user: {}", userId);
        } else {
            if (cart.getItems().isEmpty()) {
                throw new InvalidItemException("Cannot checkout an empty cart.");
            }
            log.info("Checking out all items for user: {}", userId);
        }

        validateAllItemInventories(itemsToCheckout);

        String transactionId = UUID.randomUUID().toString();
        cart.setTransactionId(transactionId);
        Cart savedCart = cartRepository.save(cart);
        Hibernate.initialize(savedCart.getItems());
        cartRedisRepository.save(userId, savedCart);

        List<CartItemResponse> cartItems = itemsToCheckout.stream()
                .map(item -> {
                    // Normalize color
                    String normalizedColor = normalizeColor(item.getColor());
                    InventoryDto inventory = checkInventoryWithCircuitBreaker(item.getProductId(), normalizedColor);
                    boolean isAvailable = inventory != null && item.getQuantity() <= inventory.getQuantity();
                    return new CartItemResponse(
                            item.getProductId(),
                            item.getProductName(),
                            item.getPrice(),
                            item.getQuantity(),
                            normalizedColor,
                            isAvailable
                    );
                })
                .collect(Collectors.toList());

        // Normalize selectedItems for CheckoutInitiatedEvent
        List<CartItemIdentifier> normalizedSelectedItems = null;
        if (selectedItems != null) {
            normalizedSelectedItems = selectedItems.stream()
                    .map(item -> new CartItemIdentifier(item.getProductId(), normalizeColor(item.getColor())))
                    .collect(Collectors.toList());
        }

        CheckoutInitiatedEvent event = CheckoutInitiatedEvent.builder()
                .transactionId(transactionId)
                .userId(userId)
                .cartItems(cartItems)
                .shippingAddress(checkoutRequest.getShippingAddress())
                .paymentMethod(checkoutRequest.getPaymentMethod())
                .selectedItems(normalizedSelectedItems)
                .build();

        cartEventProducer.sendCheckoutInitiatedEvent(event);
        log.info("CheckoutInitiatedEvent sent for user: {} with transactionId: {}", userId, transactionId);

        return new SagaInitiationResponse(transactionId, selectedItems != null ? "Selected items checkout initiated" : "Checkout initiated");
    }

    @Override
    @Transactional
    public void finalizeSuccessfulCheckout(OrderCompletedEvent event) throws CartNotFoundException {
        log.info("Finalizing successful checkout for user: {} with transactionId: {}", event.getUserId(), event.getTransactionId());
        Cart cart = getCartForUpdate(event.getUserId());
        Hibernate.initialize(cart.getItems());

        if (cart.getTransactionId() == null || !cart.getTransactionId().equals(event.getTransactionId())) {
            log.warn("TransactionId mismatch or null for user: {}. Expected: {}, Found: {}", event.getUserId(), event.getTransactionId(), cart.getTransactionId());
            return;
        }

        List<CartItemIdentifier> selectedItems = event.getSelectedItems();
        if (selectedItems == null || selectedItems.isEmpty()) {
            cart.getItems().clear();
            log.info("Cleared all items from cart for user: {}", event.getUserId());
        } else {
            // Normalize selectedItems before comparison for removal
            List<CartItemIdentifier> normalizedSelectedItems = selectedItems.stream()
                    .map(sel -> new CartItemIdentifier(sel.getProductId(), normalizeColor(sel.getColor())))
                    .collect(Collectors.toList());

            cart.getItems().removeIf(item -> normalizedSelectedItems.stream()
                    .anyMatch(sel -> sel.getProductId().equals(item.getProductId()) &&
                            normalizeColor(item.getColor()).equals(sel.getColor())));
            log.info("Removed selected items from cart for user: {}", event.getUserId());
        }

        cart.setTotalPrice(calculateTotalPrice(cart));
        cart.setTransactionId(null);

        Cart savedCart = cartRepository.save(cart);
        Hibernate.initialize(savedCart.getItems());
        cartRedisRepository.save(event.getUserId(), savedCart);
        log.info("Cart updated and cache updated for user: {} after successful checkout", event.getUserId());
    }

    @Override
    @Transactional
    public void compensateFailedCheckout(CheckoutFailedEvent event) {
        log.info("Compensating failed checkout for user: {} with transactionId: {}", event.getUserId(), event.getTransactionId());
        Cart cart = cartRepository.findByUserId(event.getUserId())
                .orElse(null);

        if (cart == null || !event.getTransactionId().equals(cart.getTransactionId())) {
            log.warn("Cart not found or transactionId mismatch for user: {}. Skipping compensation.", event.getUserId());
            return;
        }

        Hibernate.initialize(cart.getItems());
        cart.setTransactionId(null);
        Cart savedCart = cartRepository.save(cart);
        Hibernate.initialize(savedCart.getItems());
        cartRedisRepository.save(event.getUserId(), savedCart);
        log.info("TransactionId reset for user: {} after failed checkout", event.getUserId());
    }

    @Override
    @Transactional
    public CartResponse createCart(String userId) {
        log.info("Explicitly creating new cart for user: {}", userId);

        // Check if cart already exists for the user
        Optional<Cart> existingCart = cartRepository.findByUserId(userId);
        if (existingCart.isPresent()) {
            log.info("Cart already exists for user: {}", userId);
            Cart cart = existingCart.get();
            Hibernate.initialize(cart.getItems());
            return toCartResponse(cart);
        }

        // Create a new cart
        try {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setTotalPrice(0);
            Cart savedCart = cartRepository.save(cart);
            Hibernate.initialize(savedCart.getItems());

            // Cache the cart in Redis
            cartRedisRepository.save(userId, savedCart);
            log.info("New cart created and cached for user: {}", userId);

            return toCartResponse(savedCart);
        } catch (DataIntegrityViolationException e) {
            log.warn("Data integrity violation during cart creation for user {}, likely concurrent creation", userId, e);
            // If there was a race condition, try to fetch the cart that was created
            Cart newCart = cartRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        Cart fallbackCart = new Cart();
                        fallbackCart.setUserId(userId);
                        fallbackCart.setTotalPrice(0);
                        return cartRepository.save(fallbackCart);
                    });

            Hibernate.initialize(newCart.getItems());
            cartRedisRepository.save(userId, newCart);
            return toCartResponse(newCart);
        }
    }

    @Override
    @Transactional
    public CartResponse createGuestCart(String guestId) {
        log.info("Creating new guest cart with ID: {}", guestId);

        Cart cart = new Cart();
        cart.setUserId(guestId);
        cart.setItems(new ArrayList<>());
        cart.setTotalPrice(0);

        // Save to Redis only, not database
        cartRedisRepository.saveGuestCart(guestId, cart);

        return toCartResponse(cart);
    }

    @Override
    public CartResponse getGuestCartById(String guestId) throws CartNotFoundException {
        log.info("Fetching guest cart with ID: {}", guestId);

        Cart cart = cartRedisRepository.findByGuestId(guestId);
        if (cart == null) {
            log.error("Guest cart not found in Redis with ID: {}", guestId);
            throw new CartNotFoundException("Guest cart not found with ID: " + guestId);
        }

        // Log for debugging
        if (cart.getItems() != null) {
            log.info("Retrieved guest cart from Redis with {} items for guest: {}", cart.getItems().size(), guestId);

            // Log item details for debugging
            for (CartItems item : cart.getItems()) {
                log.info("Item in cart: productId={}, productName={}, color={}, quantity={}",
                        item.getProductId(), item.getProductName(), item.getColor(), item.getQuantity());
            }
        } else {
            log.warn("Items collection is null in guest cart from Redis for guest: {}", guestId);
            // Initialize empty list if items is null
            cart.setItems(new ArrayList<>());
        }

        CartResponse response = toCartResponse(cart);
        log.info("Returning CartResponse with {} items for guest: {}",
                response.getItems() != null ? response.getItems().size() : 0, guestId);

        return response;
    }

    @Override
    public CartResponse addItemToGuestCart(String guestId, CartItemRequest cartItemRequest) throws CartNotFoundException, InvalidItemException {
        log.info("Adding item to guest cart: {}, product: {}, color: '{}'",
                guestId, cartItemRequest.getProductId(), cartItemRequest.getColor());

        Cart cart = cartRedisRepository.findByGuestId(guestId);
        if (cart == null) {
            // Create new cart if it doesn't exist
            log.info("Guest cart not found, creating new one for guest: {}", guestId);
            cart = new Cart();
            cart.setUserId(guestId);
            cart.setItems(new ArrayList<>());
            cart.setTotalPrice(0);
        } else {
            log.info("Found existing guest cart for guest: {} with {} items",
                    guestId, cart.getItems() != null ? cart.getItems().size() : 0);

            // Ensure items is not null
            if (cart.getItems() == null) {
                log.warn("Items collection is null in existing cart, initializing empty list");
                cart.setItems(new ArrayList<>());
            }
        }

        // Normalize color
        String normalizedColor = normalizeColor(cartItemRequest.getColor());
        log.info("Normalized color from '{}' to '{}'", cartItemRequest.getColor(), normalizedColor);

        try {
            // Check inventory
            InventoryDto inventory = checkInventoryWithCircuitBreaker(cartItemRequest.getProductId(), normalizedColor);
            log.info("Inventory check passed for product: {}, color: {}, available: {}",
                    cartItemRequest.getProductId(), normalizedColor, inventory.getQuantity());

            CartItems cartItemToAdd = new CartItems();
            cartItemToAdd.setProductId(cartItemRequest.getProductId());
            cartItemToAdd.setQuantity(cartItemRequest.getQuantity());
            cartItemToAdd.setColor(cartItemRequest.getColor());
            cartItemToAdd.setProductName(inventory.getProductName());
            cartItemToAdd.setPrice(inventory.getCurrentPrice());
            cartItemToAdd.setCart(cart);

            // Check inventory quantity
            if (cartItemRequest.getQuantity() > inventory.getQuantity()) {
                throw new InvalidItemException("Insufficient inventory for " + cartItemToAdd.getProductId() +
                    ", color: " + normalizedColor + ". Available: " + inventory.getQuantity() +
                    ", requested: " + cartItemRequest.getQuantity());
            }

            // Check if product already exists in cart
            Optional<CartItems> existingItemOpt = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(cartItemToAdd.getProductId()) &&
                            normalizeColor(item.getColor()).equals(normalizedColor))
                    .findFirst();

            if (existingItemOpt.isPresent()) {
                // Update quantity if product exists
                CartItems existingItem = existingItemOpt.get();
                int newQuantity = existingItem.getQuantity() + cartItemRequest.getQuantity();

                // Check inventory again
                if (newQuantity > inventory.getQuantity()) {
                    throw new InvalidItemException("Insufficient inventory for " + cartItemToAdd.getProductId() +
                        ", color: " + normalizedColor + ". Available: " + inventory.getQuantity() +
                        ", requested total: " + newQuantity);
                }

                existingItem.setQuantity(newQuantity);
                log.info("Updated existing item quantity to {} for product: {}, color: {}",
                        newQuantity, existingItem.getProductId(), existingItem.getColor());
            } else {
                // Add new product to cart
                cart.getItems().add(cartItemToAdd);
                log.info("Added new item to cart: product: {}, color: {}, quantity: {}",
                        cartItemToAdd.getProductId(), cartItemToAdd.getColor(), cartItemToAdd.getQuantity());
            }

            // Update total price
            cart.setTotalPrice(calculateTotalPrice(cart));

            // Save to Redis
            cartRedisRepository.saveGuestCart(guestId, cart);
            log.info("Saved guest cart to Redis with {} items", cart.getItems().size());

            // Verify saved cart
            Cart savedCart = cartRedisRepository.findByGuestId(guestId);
            if (savedCart != null && savedCart.getItems() != null) {
                log.info("Verified guest cart in Redis: contains {} items", savedCart.getItems().size());

                // Log details if debug enabled
                if (log.isDebugEnabled()) {
                    savedCart.getItems().forEach(item -> {
                        log.debug("Verified item: productId={}, color={}, quantity={}",
                                item.getProductId(), item.getColor(), item.getQuantity());
                    });
                }
            } else {
                log.warn("Failed to verify guest cart in Redis: {}",
                        savedCart == null ? "cart is null" : "items collection is null");
            }

            CartResponse response = toCartResponse(cart);
            log.info("Returning CartResponse with {} items", response.getItems().size());
            return response;
        } catch (InvalidItemException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error adding item to guest cart: {}", guestId, e);
            throw new RuntimeException("Failed to add item to guest cart", e);
        }
    }

    @Override
    public CartResponse updateGuestCartItem(String guestId, String productId, Integer quantity, String color) throws CartNotFoundException, InvalidItemException {
        log.info("Updating item in guest cart: {}, product: {}, color: {}, quantity: {}", guestId, productId, color, quantity);

        Cart cart = cartRedisRepository.findByGuestId(guestId);
        if (cart == null) {
            throw new CartNotFoundException("Guest cart not found with ID: " + guestId);
        }

        // Normalize color
        String normalizedColor = normalizeColor(color);
        log.info("Normalized color for update: '{}' to '{}'", color, normalizedColor);

        // Log cart items for debugging
        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            log.info("Guest cart {} contains {} items", guestId, cart.getItems().size());
            for (CartItems item : cart.getItems()) {
                log.info("Cart item: productId={}, color='{}', normalizedColor='{}'",
                       item.getProductId(), item.getColor(), normalizeColor(item.getColor()));
            }
        } else {
            log.warn("Guest cart {} is empty or has null items", guestId);
        }

        try {
            // Check inventory
            InventoryDto inventory = checkInventoryWithCircuitBreaker(productId, normalizedColor);

            if (quantity > inventory.getQuantity()) {
                throw new InvalidItemException("Insufficient inventory for " + productId +
                    ", color: " + normalizedColor + ". Available: " + inventory.getQuantity() +
                    ", requested: " + quantity);
            }

            // Find product in cart - use case-insensitive matching for color
            Optional<CartItems> itemOpt = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId) &&
                            (item.getColor().equalsIgnoreCase(color) ||
                             normalizeColor(item.getColor()).equalsIgnoreCase(normalizedColor)))
                    .findFirst();

            if (itemOpt.isPresent()) {
                CartItems item = itemOpt.get();
                log.info("Found matching item: productId={}, color='{}', quantity={}",
                        item.getProductId(), item.getColor(), item.getQuantity());

                if (quantity <= 0) {
                    // Remove product if quantity <= 0
                    cart.getItems().remove(item);
                    log.info("Removed item from cart due to quantity <= 0");
                } else {
                    // Update quantity
                    item.setQuantity(quantity);
                    log.info("Updated item quantity to {}", quantity);
                }

                // Update total price
                cart.setTotalPrice(calculateTotalPrice(cart));

                // Save to Redis
                cartRedisRepository.saveGuestCart(guestId, cart);
                log.info("Saved updated cart to Redis");

                return toCartResponse(cart);
            } else {
                log.warn("Item not found in cart: productId={}, color={}, normalizedColor={}",
                        productId, color, normalizedColor);
                throw new InvalidItemException("Item not found in cart: " + productId + ", color: " + normalizedColor);
            }
        } catch (InvalidItemException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating item in guest cart: {}", guestId, e);
            throw new RuntimeException("Failed to update item in guest cart", e);
        }
    }

    @Override
    public CartResponse removeItemFromGuestCart(String guestId, String productId, String color) throws CartNotFoundException {
        log.info("Removing item from guest cart: {}, product: {}, color: {}", guestId, productId, color);

        Cart cart = cartRedisRepository.findByGuestId(guestId);
        if (cart == null) {
            throw new CartNotFoundException("Guest cart not found with ID: " + guestId);
        }

        // Normalize color
        String normalizedColor = normalizeColor(color);

        // Remove product from cart
        boolean removed = cart.getItems().removeIf(item ->
                item.getProductId().equals(productId) &&
                normalizeColor(item.getColor()).equals(normalizedColor));

        if (removed) {
            // Update total price
            cart.setTotalPrice(calculateTotalPrice(cart));

            // Save to Redis
            cartRedisRepository.saveGuestCart(guestId, cart);
        }

        return toCartResponse(cart);
    }

    @Override
    public void clearGuestCart(String guestId) throws CartNotFoundException {
        log.info("Clearing guest cart: {}", guestId);

        Cart cart = cartRedisRepository.findByGuestId(guestId);
        if (cart == null) {
            throw new CartNotFoundException("Guest cart not found with ID: " + guestId);
        }

        // Clear all products
        cart.getItems().clear();
        cart.setTotalPrice(0);

        // Save to Redis
        cartRedisRepository.saveGuestCart(guestId, cart);
    }

    @Override
    @Transactional
    public CartResponse mergeGuestCartToUserCart(String userId, String guestId) throws CartNotFoundException, InvalidItemException {
        log.info("Merging guest cart {} into user cart {}", guestId, userId);

        // Get guest cart
        Cart guestCart = cartRedisRepository.findByGuestId(guestId);
        if (guestCart == null) {
            throw new CartNotFoundException("Guest cart not found with ID: " + guestId);
        }

        // Convert guest cart items to CartItemRequest
        List<CartItemRequest> guestCartItems = guestCart.getItems().stream()
                .map(item -> new CartItemRequest(
                        item.getProductId(),
                        item.getQuantity(),
                        normalizeColor(item.getColor())
                ))
                .collect(Collectors.toList());

        // Merge into user cart
        CartResponse mergedCart = mergeListItemToCart(userId, guestCartItems);

        // Delete guest cart after successful merge
        cartRedisRepository.deleteGuestCart(guestId);

        return mergedCart;
    }

    // --- Helper Methods ---

    private Cart getCartForUpdate(String userId) throws CartNotFoundException {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
    }

    private Cart createNewCart(String userId) {
        try {
            log.info("Creating new cart for user: {}", userId);
            CartResponse cartResponse = createCart(userId);
            Optional<Cart> cart = cartRepository.findByUserId(userId);
            return cart.get(); // Safe because createCart ensures a cart exists
        } catch (Exception e) {
            log.error("Unexpected error in createNewCart for user {}: {}", userId, e.getMessage(), e);
            // Fallback to original implementation if something goes wrong
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            newCart.setTotalPrice(0);
            Cart savedCart = cartRepository.save(newCart);
            Hibernate.initialize(savedCart.getItems());
            cartRedisRepository.save(userId, savedCart);
            return savedCart;
        }
    }

    private InventoryDto checkInventoryWithCircuitBreaker(String productId, String color) throws InvalidItemException {
        // Handle null or empty color
        final String colorParam = (color == null || color.trim().isEmpty()) ? "default" : color;

        InventoryDto inventory = cbFactory.create("inventoryService").run(
                () -> {
                    log.debug("Calling inventory service for product: {}, color: {}", productId, colorParam);
                    return inventoryClient.getProductInventory(productId, colorParam).getBody();
                },
                throwable -> {
                    log.error("CircuitBreaker: Failed to fetch inventory for product: {}, color: {}", productId, colorParam, throwable);
                    throw new InvalidItemException("Unable to verify inventory (service unavailable) for product: " + productId + ", color: " + colorParam);
                }
        );
        if (inventory == null) {
            log.error("Inventory service returned null for product: {}, color: {}", productId, colorParam);
            throw new InvalidItemException("Inventory information not found for product: " + productId + ", color: " + colorParam);
        }
        return inventory;
    }

    private void validateAllItemInventories(List<CartItems> items) throws InvalidItemException {
        for (CartItems item : items) {
            InventoryDto inventory = checkInventoryWithCircuitBreaker(item.getProductId(), item.getColor());
            if (item.getQuantity() > inventory.getQuantity()) {
                throw new InvalidItemException("Insufficient inventory during final check for " + item.getProductId() + ", color: " + item.getColor() +
                        ". Available: " + inventory.getQuantity() + ", requested: " + item.getQuantity());
            }
        }
        log.info("All item inventories validated successfully.");
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(RETRY_DELAY_MS);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Thread interrupted during retry delay", ie);
        }
    }

    private int parsePriceToInt(Integer price) {
        return price != null ? price : 0;
    }

    private Integer calculateTotalPrice(Cart cart) {
        return cart.getItems().stream()
                .mapToInt(item -> parsePriceToInt(item.getPrice()) * item.getQuantity())
                .sum();
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    // Normalize color
                    String normalizedColor = normalizeColor(item.getColor());
                    InventoryDto inventory = null;
                    boolean checkInventory = true;

                    if (checkInventory) {
                        try {
                            inventory = checkInventoryWithCircuitBreaker(item.getProductId(), normalizedColor);
                        } catch (Exception e) {
                            log.warn("Failed to get inventory during response mapping for product: {}, color: {}. Marking as unavailable.",
                                    item.getProductId(), normalizedColor, e);
                            inventory = null;
                        }
                    }

                    boolean available = inventory != null && item.getQuantity() <= inventory.getQuantity();

                    String productName = item.getProductName() != null
                            ? item.getProductName()
                            : (inventory != null ? inventory.getProductName() : "N/A");

                    Integer price = item.getPrice();
                    if (price == null && inventory != null && inventory.getCurrentPrice() != null) {
                        price = inventory.getCurrentPrice();
                    }

                    return new CartItemResponse(
                            item.getProductId(),
                            productName,
                            price,
                            item.getQuantity(),
                            normalizedColor,
                            available
                    );
                })
                .collect(Collectors.toList());

        Integer totalPrice = calculateTotalPrice(cart);

        return new CartResponse(cart.getUserId(), totalPrice, itemResponses);
    }

    // Helper to normalize color to "default" when null or empty
    // Returns normalized color for comparison (lowercase)
    private String normalizeColor(String color) {
        return (color == null || color.trim().isEmpty()) ? "default" : color;
    }
}
