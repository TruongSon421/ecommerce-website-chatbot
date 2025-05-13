package com.eazybytes.service;

import com.eazybytes.dto.*;
import com.eazybytes.event.model.CheckoutFailedEvent;
import com.eazybytes.event.model.OrderCompletedEvent;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;

import java.util.List;

public interface CartService {
    CartResponse getCartByUserId(String userId) throws CartNotFoundException;
    CartResponse addItemToCart(String userId, CartItemRequest cartItemRequest) throws CartNotFoundException, InvalidItemException;
    CartResponse updateCartItem(String userId, String productId, Integer quantity, String color) throws CartNotFoundException, InvalidItemException;
    CartResponse removeItemFromCart(String userId, String productId, String color) throws CartNotFoundException;
    void clearCart(String userId) throws CartNotFoundException;
    
    // Create a new cart for a user
    CartResponse createCart(String userId);

    // Merge ListItem 
    CartResponse mergeListItemToCart(String userId, List<CartItemRequest> guestCartItems) throws CartNotFoundException, InvalidItemException;

    // Saga Methods
    SagaInitiationResponse initiateCheckoutSaga(CheckoutRequest checkoutRequest, List<CartItemIdentifier> selectedItems) throws CartNotFoundException, InvalidItemException;
    void finalizeSuccessfulCheckout(OrderCompletedEvent event) throws CartNotFoundException;
    void compensateFailedCheckout(CheckoutFailedEvent event);   
}