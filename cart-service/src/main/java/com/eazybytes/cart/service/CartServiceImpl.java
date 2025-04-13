package com.eazybytes.cart.service;

import com.eazybytes.cart.client.InventoryClient;
import com.eazybytes.cart.dto.*;
import com.eazybytes.cart.event.CartEventProducer;
import com.eazybytes.cart.event.model.CheckoutFailedEvent;
import com.eazybytes.cart.event.model.CheckoutInitiatedEvent;
import com.eazybytes.cart.event.model.OrderCompletedEvent;
import com.eazybytes.cart.exception.CartNotFoundException;
import com.eazybytes.cart.exception.InvalidItemException;
import com.eazybytes.cart.model.Cart;
import com.eazybytes.cart.model.CartItems;
import com.eazybytes.cart.repository.CartRedisRepository;
import com.eazybytes.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartRedisRepository cartRedisRepository;
    private final CartEventProducer cartEventProducer;
    private final InventoryClient inventoryClient;
    private final CircuitBreakerFactory<?, ?> cbFactory;

    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 50;

    @Override
    public CartResponse getCartByUserId(String userId) throws CartNotFoundException {
        Cart cart = cartRedisRepository.findByUserId(userId);
        if (cart != null) {
            log.debug("Cart found in Redis for user: {}", userId);
            return toCartResponse(cart);
        }

        log.debug("Cart not found in Redis, fetching from DB for user: {}", userId);
        cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        cartRedisRepository.save(userId, cart);
        log.debug("Cart fetched from MySQL and cached in Redis for user: {}", userId);
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(String userId, CartItemRequest cartItemRequest) throws CartNotFoundException, InvalidItemException {
        int attempt = 0;
        while (true) {
            try {
                log.info("Attempt {} to add item {} for user: {}", attempt + 1, cartItemRequest.getProductId(), userId);
                Cart cart = getCartForUpdate(userId);

                CartItems cartItemToAdd = new CartItems();
                cartItemToAdd.setProductId(cartItemRequest.getProductId());
                cartItemToAdd.setQuantity(cartItemRequest.getQuantity());
                cartItemToAdd.setColor(cartItemRequest.getColor());

                InventoryDto inventory = checkInventoryWithCircuitBreaker(cartItemToAdd.getProductId(), cartItemToAdd.getColor());
                cartItemToAdd.setProductName(inventory.getProductName());
                cartItemToAdd.setPrice(inventory.getCurrentPrice());

                Optional<CartItems> existingItemOpt = cart.getItems().stream()
                        .filter(item -> item.getProductId().equals(cartItemToAdd.getProductId()) && item.getColor().equals(cartItemToAdd.getColor()))
                        .findFirst();

                int currentQuantityInCart = existingItemOpt.map(CartItems::getQuantity).orElse(0);
                int requestedTotalQuantity = currentQuantityInCart + cartItemToAdd.getQuantity();

                if (requestedTotalQuantity > inventory.getQuantity()) {
                    throw new InvalidItemException("Insufficient inventory for " + cartItemToAdd.getProductId() + ", color: " + cartItemToAdd.getColor() +
                            ". Available: " + inventory.getQuantity() + ", requested total: " + requestedTotalQuantity);
                }

                if (existingItemOpt.isPresent()) {
                    existingItemOpt.get().setQuantity(requestedTotalQuantity);
                } else {
                    cart.addItem(cartItemToAdd);
                }
                cart.setTotalPrice(calculateTotalPrice(cart));

                Cart savedCart = cartRepository.save(cart);
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
                log.info("Attempt {} to update item {} (color: {}) to quantity {} for user: {}", attempt + 1, productId, color, quantity, userId);
                Cart cart = getCartForUpdate(userId);

                InventoryDto inventory = checkInventoryWithCircuitBreaker(productId, color);
                if (quantity > inventory.getQuantity()) {
                    throw new InvalidItemException("Insufficient inventory for " + productId + ", color: " + color +
                            ". Available: " + inventory.getQuantity() + ", requested: " + quantity);
                }

                Optional<CartItems> itemOpt = cart.getItems().stream()
                        .filter(item -> item.getProductId().equals(productId) && item.getColor().equals(color))
                        .findFirst();

                if (itemOpt.isPresent()) {
                    CartItems item = itemOpt.get();
                    if (quantity <= 0) {
                        cart.getItems().remove(item);
                        log.info("Item {} (color: {}) removed due to quantity <= 0 for user {}", productId, color, userId);
                    } else {
                        item.setQuantity(quantity);
                        log.info("Item {} (color: {}) quantity updated to {} for user {}", productId, color, quantity, userId);
                    }
                }
                cart.setTotalPrice(calculateTotalPrice(cart));

                Cart savedCart = cartRepository.save(cart);
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
                log.info("Attempt {} to remove item {} (color: {}) for user: {}", attempt + 1, productId, color, userId);
                Cart cart = getCartForUpdate(userId);

                boolean removed = cart.getItems().removeIf(item -> item.getProductId().equals(productId) && item.getColor().equals(color));
                if (!removed) {
                    log.warn("Attempted to remove item {} (color: {}) not found in cart for user {}", productId, color, userId);
                    cartRedisRepository.save(userId, cart);
                    return toCartResponse(cart);
                }
                cart.setTotalPrice(calculateTotalPrice(cart));

                Cart savedCart = cartRepository.save(cart);
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
    public void clearCart(String userId) throws CartNotFoundException {
        int attempt = 0;
        while (true) {
            try {
                log.info("Attempt {} to clear cart for user: {}", attempt + 1, userId);
                Cart cart = getCartForUpdate(userId);

                if (cart.getItems().isEmpty()) {
                    log.info("Cart already empty for user {}. No action needed.", userId);
                    cartRedisRepository.delete(userId);
                    return;
                }
                cart.getItems().clear();
                cart.setTotalPrice("0");

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

        List<CartItems> itemsToCheckout = cart.getItems();
        if (selectedItems != null && !selectedItems.isEmpty()) {
            itemsToCheckout = cart.getItems().stream()
                    .filter(item -> selectedItems.stream()
                            .anyMatch(sel -> sel.getProductId().equals(item.getProductId()) && sel.getColor().equals(item.getColor())))
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
        cartRepository.save(cart);

        List<CartItemResponse> cartItems = itemsToCheckout.stream()
                .map(item -> {
                    InventoryDto inventory = checkInventoryWithCircuitBreaker(item.getProductId(), item.getColor());
                    boolean isAvailable = inventory != null && item.getQuantity() <= inventory.getQuantity();
                    return new CartItemResponse(
                            item.getProductId(),
                            item.getProductName(),
                            item.getPrice(),
                            item.getQuantity(),
                            item.getColor(),
                            isAvailable
                    );
                })
                .collect(Collectors.toList());

        // Sử dụng builder để tạo CheckoutInitiatedEvent
        CheckoutInitiatedEvent event = CheckoutInitiatedEvent.builder()
                .transactionId(transactionId)
                .userId(userId)
                .cartItems(cartItems)
                .shippingAddress(checkoutRequest.getShippingAddress())
                .paymentMethod(checkoutRequest.getPaymentMethod())
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

        if (cart.getTransactionId() == null || !cart.getTransactionId().equals(event.getTransactionId())) {
            log.warn("TransactionId mismatch or null for user: {}. Expected: {}, Found: {}", event.getUserId(), event.getTransactionId(), cart.getTransactionId());
            return;
        }

        List<CartItemIdentifier> selectedItems = event.getSelectedItems();
        if (selectedItems == null || selectedItems.isEmpty()) {
            // Xóa toàn bộ giỏ hàng nếu không có selectedItems
            cart.getItems().clear();
            log.info("Cleared all items from cart for user: {}", event.getUserId());
        } else {
            // Chỉ xóa các selectedItems
            cart.getItems().removeIf(item -> selectedItems.stream()
                    .anyMatch(sel -> sel.getProductId().equals(item.getProductId()) && sel.getColor().equals(item.getColor())));
            log.info("Removed selected items from cart for user: {}", event.getUserId());
        }

        cart.setTotalPrice(calculateTotalPrice(cart));
        cart.setTransactionId(null);

        cartRepository.save(cart);
        cartRedisRepository.delete(event.getUserId());
        log.info("Cart updated and cache deleted for user: {} after successful checkout", event.getUserId());
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

        cart.setTransactionId(null);
        cartRepository.save(cart);
        cartRedisRepository.save(event.getUserId(), cart);
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
            cart.setTotalPrice("0");
            Cart savedCart = cartRepository.save(cart);
            cartRedisRepository.save(userId, savedCart);
            log.info("New cart created and cached for user: {}", userId);
            return savedCart;
        } catch (DataIntegrityViolationException e) {
            log.warn("Data integrity violation during cart creation for user {}, likely concurrent creation. Fetching existing.", userId, e);
            if (e.getRootCause() instanceof SQLException sqlEx && "23505".equals(sqlEx.getSQLState())) {
                Cart existingCart = cartRepository.findByUserId(userId)
                        .orElseThrow(() -> new CartNotFoundException("Cart creation failed unexpectedly for user: " + userId));
                cartRedisRepository.save(userId, existingCart);
                return existingCart;
            }
            throw e;
        }
    }

    private InventoryDto checkInventoryWithCircuitBreaker(String productId, String color) throws InvalidItemException {
        InventoryDto inventory = cbFactory.create("inventoryService").run(
                () -> {
                    log.debug("Calling inventory service for product: {}, color: {}", productId, color);
                    return inventoryClient.getProductInventory(productId, color).getBody();
                },
                throwable -> {
                    log.error("CircuitBreaker: Failed to fetch inventory for product: {}, color: {}", productId, color, throwable);
                    throw new InvalidItemException("Unable to verify inventory (service unavailable) for product: " + productId + ", color: " + color);
                }
        );
        if (inventory == null) {
            log.error("Inventory service returned null for product: {}, color: {}", productId, color);
            throw new InvalidItemException("Inventory information not found for product: " + productId + ", color: " + color);
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

    private double parsePriceToDouble(String price) {
        try {
            return price != null && !price.isEmpty() ? Double.parseDouble(price) : 0.0;
        } catch (NumberFormatException e) {
            log.warn("Invalid price format: {}, defaulting to 0.0", price);
            return 0.0;
        }
    }

    private String calculateTotalPrice(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> parsePriceToDouble(item.getPrice()) * item.getQuantity())
                .sum();
        return String.valueOf(total);
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    InventoryDto inventory = null;
                    boolean checkInventory = true;
                    if (checkInventory) {
                        try {
                            inventory = checkInventoryWithCircuitBreaker(item.getProductId(), item.getColor());
                        } catch (Exception e) {
                            log.warn("Failed to get inventory during response mapping for product: {}, color: {}. Marking as unavailable.", item.getProductId(), item.getColor(), e);
                            inventory = null;
                        }
                    }
                    boolean isAvailable = inventory != null && item.getQuantity() <= inventory.getQuantity();
                    String productName = item.getProductName() != null ? item.getProductName() : (inventory != null ? inventory.getProductName() : "N/A");
                    String price = item.getPrice() != null ? item.getPrice() : (inventory != null ? inventory.getCurrentPrice() : "N/A");

                    return new CartItemResponse(
                            item.getProductId(),
                            productName,
                            price,
                            item.getQuantity(),
                            item.getColor(),
                            isAvailable
                    );
                })
                .collect(Collectors.toList());
        return new CartResponse(cart.getUserId(), cart.getTotalPrice(), itemResponses);
    }
}