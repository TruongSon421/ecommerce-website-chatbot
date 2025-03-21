package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.event.CartEvent;
import com.eazybytes.event.CartEventProducer;
import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import com.eazybytes.repository.CartRepository;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartEventProducer cartEventProducer;
    private final InventoryClient inventoryClient;

    @Override
    public Cart getCartByUserId(String userId) throws CartNotFoundException {
        return cartRepository.findByUserId(userId)
                .orElse(createNewCart(userId));
    }

    @Override
    @Transactional
    public Cart addItemToCart(String userId, CartItems cartItem) throws CartNotFoundException, InvalidItemException {
        Cart cart = getCartByUserId(userId);

        // Lấy thông tin sản phẩm từ inventory service
        ResponseEntity<InventoryDto> response = inventoryClient.getProductInventory(cartItem.getProductId(), cartItem.getColor());
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new InvalidItemException("Product not found: " + cartItem.getProductId() + ", color: " + cartItem.getColor());
        }
        InventoryDto inventory = response.getBody();
        cartItem.setProductName(inventory.getProductName());
        cartItem.setPrice(inventory.getCurrentPrice()); // Giữ nguyên String từ InventoryDto

        Optional<CartItems> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(cartItem.getProductId()) && item.getColor().equals(cartItem.getColor()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItems item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartItem.getQuantity());
        } else {
            cart.getItems().add(cartItem);
        }

        cart.setTotalPrice(calculateTotalPrice(cart));
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException {
        Cart cart = getCartByUserId(userId);

        cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId) && item.getColor().equals(color))
                .findFirst()
                .ifPresent(item -> {
                    if (quantity <= 0) {
                        cart.getItems().remove(item);
                    } else {
                        item.setQuantity(quantity);
                    }
                });

        cart.setTotalPrice(calculateTotalPrice(cart));
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public Cart removeItemFromCart(String userId, String productId) throws CartNotFoundException {
        Cart cart = getCartByUserId(userId);

        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.setTotalPrice(calculateTotalPrice(cart));
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(String userId) throws CartNotFoundException {
        Cart cart = getCartByUserId(userId);

        cart.getItems().clear();
        cart.setTotalPrice("0"); // Giá trị mặc định là chuỗi "0"
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void checkoutCart(String userId) throws CartNotFoundException {
        Cart cart = getCartByUserId(userId);
        if (!cart.getItems().isEmpty()) {
            List<String> productIds = cart.getItems().stream()
                    .map(CartItems::getProductId)
                    .collect(Collectors.toList());
            log.info("Checkout cart for user: {}", userId);
            cartEventProducer.sendCartEvent(new CartEvent("CART_CHECKOUT", userId, productIds));
            clearCart(userId);
        } else {
            log.warn("Cannot checkout empty cart for user: {}", userId);
        }
    }

    @Override
    public Cart checkoutSelectedItems(String userId, List<String> selectedProductIds) throws CartNotFoundException, InvalidItemException {
        Cart cart = getCartByUserId(userId);
        List<CartItems> selectedItems = cart.getItems().stream()
                .filter(item -> selectedProductIds.contains(item.getProductId()))
                .collect(Collectors.toList());
        if (selectedItems.isEmpty()) {
            throw new InvalidItemException("No valid items selected for checkout");
        }
        cartEventProducer.sendCartEvent(new CartEvent("SELECTED_ITEMS_CHECKOUT", userId, selectedProductIds));
        return cart;
    }

    @Override
    @Transactional
    public void removeCheckedOutItems(String userId, List<String> orderedProductIds) throws CartNotFoundException {
        Cart cart = getCartByUserId(userId);

        cart.getItems().removeIf(item -> orderedProductIds.contains(item.getProductId()));
        cart.setTotalPrice(calculateTotalPrice(cart));
        cartRepository.save(cart);
    }

    private Cart createNewCart(String userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setTotalPrice("0"); // Giá trị mặc định là chuỗi "0"
        return cartRepository.save(cart);
    }

    // Hàm tiện ích chuyển đổi String sang double
    private double parsePriceToDouble(String price) {
        try {
            return price != null && !price.isEmpty() ? Double.parseDouble(price) : 0.0;
        } catch (NumberFormatException e) {
            log.warn("Invalid price format: {}, defaulting to 0.0", price);
            return 0.0;
        }
    }

    // Tính tổng giá và trả về dưới dạng String
    private String calculateTotalPrice(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(item -> parsePriceToDouble(item.getPrice()) * item.getQuantity())
                .sum();
        return String.valueOf(total); // Chuyển double thành String
    }
}