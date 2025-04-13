package com.eazybytes.cart.dto;

import lombok.Getter;

@Getter
public class CheckoutResponse {
    private final CartResponse cart;
    private final String selectedItemsTotalPrice;

    public CheckoutResponse(CartResponse cart, String selectedItemsTotalPrice) {
        this.cart = cart;
        this.selectedItemsTotalPrice = selectedItemsTotalPrice;
    }
}