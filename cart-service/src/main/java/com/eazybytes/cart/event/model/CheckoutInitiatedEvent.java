package com.eazybytes.cart.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;


import java.util.List;

import com.eazybytes.cart.dto.CartItemResponse;
import com.eazybytes.cart.service.CartItemIdentifier;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class CheckoutInitiatedEvent extends BaseSagaEvent {
    private List<CartItemResponse> cartItems;
    private String shippingAddress;
    private String paymentMethod;
    private List<CartItemIdentifier> selectedItems;
    public CheckoutInitiatedEvent(String transactionId, String userId, List<CartItemResponse> cartItems, String shippingAddress, String paymentMethod) {
        super(transactionId, userId);
        this.cartItems = cartItems;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
    }
}