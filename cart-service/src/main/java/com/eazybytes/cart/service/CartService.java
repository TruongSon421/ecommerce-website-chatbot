package com.eazybytes.cart.service;

import com.eazybytes.cart.dto.*;
import com.eazybytes.cart.event.model.CheckoutFailedEvent;
import com.eazybytes.cart.event.model.OrderCompletedEvent;
import com.eazybytes.cart.exception.CartNotFoundException;
import com.eazybytes.cart.exception.InvalidItemException;

import java.util.List;

public interface CartService {
    CartResponse getCartByUserId(String userId) throws CartNotFoundException;
    CartResponse addItemToCart(String userId, CartItemRequest cartItemRequest) throws CartNotFoundException, InvalidItemException;
    CartResponse updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException, InvalidItemException;
    CartResponse removeItemFromCart(String userId, String productId, String color) throws CartNotFoundException;
    void clearCart(String userId) throws CartNotFoundException;

    // Saga Methods
    SagaInitiationResponse initiateCheckoutSaga(CheckoutRequest checkoutRequest, List<CartItemIdentifier> selectedItems) throws CartNotFoundException, InvalidItemException;
    void finalizeSuccessfulCheckout(OrderCompletedEvent event) throws CartNotFoundException;
    void compensateFailedCheckout(CheckoutFailedEvent event);   
}