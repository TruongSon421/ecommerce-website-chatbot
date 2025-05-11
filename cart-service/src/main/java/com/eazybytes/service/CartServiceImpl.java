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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    private final CartEventProducer cartEventProducer;
    private final InventoryClient inventoryClient;
    private final CircuitBreakerFactory<?, ?> cbFactory;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 50;

    @Override
    @Transactional(readOnly = true)
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

    private void logDatabaseItems(String userId, Long cartId) {
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
                
                // Chuẩn hóa color
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
                // Chuẩn hóa color
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
                // Chuẩn hóa color
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
        
        // Lấy giỏ hàng hiện tại của người dùng
        CartResponse currentCart = getCartByUserId(userId);
        
        // Process each item in the guest cart
        for (CartItemRequest item : guestCartItems) {
            try {
                // Chuẩn hóa color
                String normalizedColor = normalizeColor(item.getColor());
                
                log.debug("Processing guest cart item: {} ({}) x{}", item.getProductId(), normalizedColor, item.getQuantity());
                
                // Validate item inventory before adding
                InventoryDto inventory = checkInventoryWithCircuitBreaker(item.getProductId(), normalizedColor);
                if (inventory == null || inventory.getQuantity() <= 0) {
                    log.warn("Skipping item due to no inventory: {} ({})", item.getProductId(), normalizedColor);
                    continue;
                }
                
                // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
                boolean itemExists = false;
                for (CartItemResponse existingItem : currentCart.getItems()) {
                    if (existingItem.getProductId().equals(item.getProductId()) && 
                        normalizeColor(existingItem.getColor()).equals(normalizedColor)) {
                        // Sản phẩm đã tồn tại, cập nhật số lượng
                        int newQuantity = existingItem.getQuantity() + item.getQuantity();
                        
                        // Kiểm tra số lượng tồn kho
                        if (newQuantity > inventory.getQuantity()) {
                            log.warn("Cannot update item quantity due to insufficient inventory: {} ({}), requested: {}, available: {}", 
                                    item.getProductId(), normalizedColor, newQuantity, inventory.getQuantity());
                            continue;
                        }
                        
                        // Cập nhật số lượng cho sản phẩm hiện tại
                        result = updateCartItem(userId, item.getProductId(), newQuantity, normalizedColor);
                        log.debug("Updated item quantity in cart: {} ({}) x{}", 
                                item.getProductId(), normalizedColor, newQuantity);
                        itemExists = true;
                        break;
                    }
                }
                
                // Nếu sản phẩm chưa tồn tại, thêm mới
                if (!itemExists) {
                    if (item.getQuantity() > inventory.getQuantity()) {
                        log.warn("Skipping item due to insufficient inventory: {} ({}), requested: {}, available: {}", 
                                item.getProductId(), normalizedColor, item.getQuantity(), inventory.getQuantity());
                        continue;
                    }
                    
                    // Tạo một CartItemRequest mới với color đã chuẩn hóa
                    CartItemRequest normalizedItem = new CartItemRequest(
                            item.getProductId(),
                            item.getQuantity(),
                            normalizedColor
                    );
                    
                    // Thêm sản phẩm mới vào giỏ hàng
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
        
        // Return the final cart state
        return result != null ? result : getCartByUserId(userId);
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
            // Chuẩn hóa colors trong selectedItems trước khi so sánh
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
                    // Chuẩn hóa color
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

        // Chuẩn hóa selectedItems cho CheckoutInitiatedEvent
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
            // Chuẩn hóa selectedItems trước khi so sánh để xóa
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

    // --- Helper Methods ---

    private Cart getCartForUpdate(String userId) throws CartNotFoundException {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
    }

    private Cart createNewCart(String userId) {
        try {
            log.info("Creating new cart for user: {}", userId);
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setTotalPrice(0);
            Cart savedCart = cartRepository.save(cart);
            Hibernate.initialize(savedCart.getItems());
            cartRedisRepository.save(userId, savedCart);
            log.info("New cart created and cached for user: {}", userId);
            return savedCart;
        } catch (DataIntegrityViolationException e) {
            log.warn("Data integrity violation during cart creation for user {}, likely concurrent creation. Creating new cart.", userId, e);
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
        // Xử lý khi color là null hoặc rỗng
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

    private int calculateTotalPrice(Cart cart) {
        return cart.getItems().stream()
                .mapToInt(item -> parsePriceToInt(item.getPrice()) * item.getQuantity())
                .sum();
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    // Chuẩn hóa color
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

                    boolean isAvailable = inventory != null && item.getQuantity() <= inventory.getQuantity();

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
                            isAvailable
                    );
                })
                .collect(Collectors.toList());

        int totalPrice = calculateTotalPrice(cart);

        return new CartResponse(cart.getUserId(), totalPrice, itemResponses);
    }

    // Helper để chuẩn hóa color thành "default" khi null hoặc rỗng
    private String normalizeColor(String color) {
        return (color == null || color.trim().isEmpty()) ? "default" : color;
    }
}