package com.eazybytes.service;

import java.util.List;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;
import com.eazybytes.dto.CheckoutResponse;
import com.eazybytes.dto.CartResponse;
import com.eazybytes.dto.CartItemRequest;
public interface CartService {
    CartResponse getCartByUserId(String userId) throws CartNotFoundException;
    CartResponse addItemToCart(String userId, CartItemRequest cartItem) throws CartNotFoundException, InvalidItemException;
    CartResponse updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException;
    CartResponse removeItemFromCart(String userId, String productId, String color) throws CartNotFoundException;
    void clearCart(String userId) throws CartNotFoundException;
    void checkoutCart(String userId);
    /**
     * Checks out selected items from the cart and initiates the order process.
     * @param userId the ID of the user
     * @param selectedProductIds list of product IDs to checkout
     * @return the updated cart after initiating checkout
     * @throws CartNotFoundException if the cart does not exist
     * @throws InvalidItemException if selected items are invalid
     */
    CheckoutResponse checkoutSelectedItems(String userId, List<CartItemIdentifier> selectedProductIds) throws CartNotFoundException, InvalidItemException;

    /**
     * Removes checked-out items from the cart based on a signal from OrderService via Kafka.
     * This method is called internally when a Kafka message is received.
     * @param userId the ID of the user
     * @param orderedProductIds list of product IDs that were successfully ordered
     */
    void removeCheckedOutItems(String userId, List<CartItemIdentifier> orderedProductIds) throws CartNotFoundException;
}

// DTO mới để xác định biến thể
// Moved to its own file: CartItemIdentifier.java
