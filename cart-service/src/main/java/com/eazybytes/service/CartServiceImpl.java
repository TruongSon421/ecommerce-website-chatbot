package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.CartResponse;
import com.eazybytes.dto.CheckoutResponse;
import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.event.CartEvent;
import com.eazybytes.event.CartEventProducer;
import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import com.eazybytes.repository.CartRepository;
import com.eazybytes.repository.CartRedisRepository;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartRedisRepository cartRedisRepository;
    private final CartEventProducer cartEventProducer;
    private final InventoryClient inventoryClient;

    @Override
    public CartResponse getCartByUserId(String userId) throws CartNotFoundException {
        Cart cart = cartRedisRepository.findByUserId(userId);
        if (cart != null) {
            log.debug("Cart found in Redis for user: {}", userId);
            return toCartResponse(cart);
        }
        cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
        cartRedisRepository.save(userId, cart);
        log.debug("Cart fetched from MySQL and cached in Redis for user: {}", userId);
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(String userId, CartItemRequest cartItemRequest) throws CartNotFoundException, InvalidItemException {
        Cart cart = getCartEntityByUserId(userId);

        CartItems cartItem = new CartItems();
        cartItem.setProductId(cartItemRequest.getProductId());
        cartItem.setQuantity(cartItemRequest.getQuantity());
        cartItem.setColor(cartItemRequest.getColor());

        ResponseEntity<InventoryDto> response = inventoryClient.getProductInventory(cartItem.getProductId(), cartItem.getColor());
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new InvalidItemException("Product not found: " + cartItem.getProductId() + ", color: " + cartItem.getColor());
        }
        InventoryDto inventory = response.getBody();
        cartItem.setProductName(inventory.getProductName());
        cartItem.setPrice(inventory.getCurrentPrice());

        // Kiểm tra số lượng tồn kho khi thêm
        Optional<CartItems> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(cartItem.getProductId()) && item.getColor().equals(cartItem.getColor()))
                .findFirst();
        int currentQuantity = existingItem.map(CartItems::getQuantity).orElse(0);
        int newQuantity = currentQuantity + cartItem.getQuantity();
        if (newQuantity > inventory.getQuantity()) {
            throw new InvalidItemException("Insufficient inventory for " + cartItem.getProductId() + ", color: " + cartItem.getColor() +
                    ". Available: " + inventory.getQuantity() + ", requested: " + newQuantity);
        }

        if (existingItem.isPresent()) {
            CartItems item = existingItem.get();
            item.setQuantity(newQuantity);
        } else {
            cart.addItem(cartItem);
        }

        cart.setTotalPrice(calculateTotalPrice(cart));
        cart = cartRepository.save(cart);
        cartRedisRepository.save(userId, cart);
        log.info("Item added to cart for user: {}", userId);
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException {
        Cart cart = getCartEntityByUserId(userId);

        ResponseEntity<InventoryDto> response = inventoryClient.getProductInventory(productId, color);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new InvalidItemException("Product not found: " + productId + ", color: " + color);
        }
        InventoryDto inventory = response.getBody();
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
            } else {
                item.setQuantity(quantity);
            }
        }

        cart.setTotalPrice(calculateTotalPrice(cart));
        cart = cartRepository.save(cart);
        cartRedisRepository.save(userId, cart);
        log.info("Cart item updated for user: {}", userId);
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(String userId, String productId, String color) throws CartNotFoundException {
        Cart cart = getCartEntityByUserId(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId) && item.getColor().equals(color));
        cart.setTotalPrice(calculateTotalPrice(cart));
        cart = cartRepository.save(cart);
        cartRedisRepository.save(userId, cart);
        log.info("Item removed from cart for user: {}", userId);
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(String userId) throws CartNotFoundException {
        Cart cart = getCartEntityByUserId(userId);
        cart.getItems().clear();
        cart.setTotalPrice("0");
        cart = cartRepository.save(cart);
        cartRedisRepository.save(userId, cart);
        log.info("Cart cleared for user: {}", userId);
    }

    @Override
    @Transactional
    public void checkoutCart(String userId) throws CartNotFoundException {
        Cart cart = getCartEntityByUserId(userId);
        if (!cart.getItems().isEmpty()) {
            // Kiểm tra tồn kho cho toàn bộ giỏ hàng
            for (CartItems item : cart.getItems()) {
                ResponseEntity<InventoryDto> response = inventoryClient.getProductInventory(item.getProductId(), item.getColor());
                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new InvalidItemException("Product not found: " + item.getProductId() + ", color: " + item.getColor());
                }
                InventoryDto inventory = response.getBody();
                if (item.getQuantity() > inventory.getQuantity()) {
                    throw new InvalidItemException("Insufficient inventory for " + item.getProductId() + ", color: " + item.getColor() +
                            ". Available: " + inventory.getQuantity() + ", requested: " + item.getQuantity());
                }
            }

            // Create a list of CartItemIdentifier for the event
            List<CartItemIdentifier> productIdentifiers = cart.getItems().stream()
                .map(item -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                .collect(Collectors.toList());
            log.info("Checkout cart for user: {}", userId);
            cartEventProducer.sendCartEvent(new CartEvent("CART_CHECKOUT", userId, productIdentifiers));
            clearCart(userId);
        } else {
            log.warn("Cannot checkout empty cart for user: {}", userId);
        }
    }

    @Override
    public CheckoutResponse checkoutSelectedItems(String userId, List<CartItemIdentifier> selectedItems) throws CartNotFoundException, InvalidItemException {
        Cart cart = getCartEntityByUserId(userId);
        List<CartItems> selectedCartItems = cart.getItems().stream()
                .filter(item -> selectedItems.stream()
                        .anyMatch(sel -> sel.getProductId().equals(item.getProductId()) && sel.getColor().equals(item.getColor())))
                .collect(Collectors.toList());
        if (selectedCartItems.isEmpty()) {
            throw new InvalidItemException("No valid items selected for checkout");
        }

        // Kiểm tra tồn kho cho các mục được chọn
        for (CartItems item : selectedCartItems) {
            ResponseEntity<InventoryDto> response = inventoryClient.getProductInventory(item.getProductId(), item.getColor());
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new InvalidItemException("Product not found: " + item.getProductId() + ", color: " + item.getColor());
            }
            InventoryDto inventory = response.getBody();
            if (item.getQuantity() > inventory.getQuantity()) {
                throw new InvalidItemException("Insufficient inventory for " + item.getProductId() + ", color: " + item.getColor() +
                        ". Available: " + inventory.getQuantity() + ", requested: " + item.getQuantity());
            }
        }

        // Create a list of CartItemIdentifier for the event
        List<CartItemIdentifier> selectedProductIdentifiers = selectedCartItems.stream()
                .map(item -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                .collect(Collectors.toList());
        String selectedTotalPrice = calculateSelectedItemsTotalPrice(cart, selectedItems);
        cartEventProducer.sendCartEvent(new CartEvent("SELECTED_ITEMS_CHECKOUT", userId, selectedProductIdentifiers));
        log.info("Checkout selected items for user {} with total -price: {}", userId, selectedTotalPrice);
        return new CheckoutResponse(toCartResponse(cart), selectedTotalPrice);
    }

    @Override
    @Transactional
    public void removeCheckedOutItems(String userId, List<CartItemIdentifier> orderedItems) throws CartNotFoundException {
        Cart cart = getCartEntityByUserId(userId);
        cart.getItems().removeIf(item -> orderedItems.stream()
            .anyMatch(ordered -> ordered.getProductId().equals(item.getProductId()) && ordered.getColor().equals(item.getColor())));
        cart.setTotalPrice(calculateTotalPrice(cart));
        cart = cartRepository.save(cart);
        cartRedisRepository.save(userId, cart);
        log.info("Checked out items removed from cart for user: {}", userId);
}

    private Cart createNewCart(String userId) {
        try {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setTotalPrice("0");
            cart = cartRepository.save(cart);
            cartRedisRepository.save(userId, cart);
            return cart;
        } catch (DataIntegrityViolationException e) {
            if (e.getRootCause() != null && e.getRootCause() instanceof SQLException) {
                SQLException sqlEx = (SQLException) e.getRootCause();
                if ("23505".equals(sqlEx.getSQLState())) {
                    Cart cart = cartRepository.findByUserId(userId)
                            .orElseThrow(() -> new CartNotFoundException("Cart not found for user: " + userId));
                    cartRedisRepository.save(userId, cart);
                    return cart;
                }
            }
            throw e;
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

    private String calculateSelectedItemsTotalPrice(Cart cart, List<CartItemIdentifier> selectedItems) {
        double total = cart.getItems().stream()
                .filter(item -> selectedItems.stream()
                        .anyMatch(sel -> sel.getProductId().equals(item.getProductId()) && sel.getColor().equals(item.getColor())))
                .mapToDouble(item -> parsePriceToDouble(item.getPrice()) * item.getQuantity())
                .sum();
        return String.valueOf(total);
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    ResponseEntity<InventoryDto> response = inventoryClient.getProductInventory(item.getProductId(), item.getColor());
                    boolean isAvailable = response.getStatusCode().is2xxSuccessful() && response.getBody() != null &&
                            item.getQuantity() <= response.getBody().getQuantity();
                    return new CartItemResponse(
                            item.getProductId(),
                            item.getProductName(),
                            item.getPrice(),
                            item.getQuantity(),
                            item.getColor(),
                            isAvailable);
                })
                .collect(Collectors.toList());
        return new CartResponse(cart.getUserId(), cart.getTotalPrice(), itemResponses);
    }

    private Cart getCartEntityByUserId(String userId) throws CartNotFoundException {
        Cart cart = cartRedisRepository.findByUserId(userId);
        if (cart != null) {
            return cart;
        }
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
    }
}