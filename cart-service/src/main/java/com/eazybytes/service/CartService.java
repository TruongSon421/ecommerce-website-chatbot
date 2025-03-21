package com.eazybytes.service;

import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import java.util.List;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;

public interface CartService {
    Cart getCartByUserId(String userId) throws CartNotFoundException;
    Cart addItemToCart(String userId, CartItems cartItem) throws CartNotFoundException, InvalidItemException;
    Cart updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException;
    Cart removeItemFromCart(String userId, String productId) throws CartNotFoundException;
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
    Cart checkoutSelectedItems(String userId, List<String> selectedProductIds) throws CartNotFoundException, InvalidItemException;

    /**
     * Removes checked-out items from the cart based on a signal from OrderService via Kafka.
     * This method is called internally when a Kafka message is received.
     * @param userId the ID of the user
     * @param orderedProductIds list of product IDs that were successfully ordered
     */
    void removeCheckedOutItems(String userId, List<String> orderedProductIds) throws CartNotFoundException;
}


