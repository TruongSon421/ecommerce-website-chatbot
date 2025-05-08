package com.eazybytes.dto;


import lombok.Getter;

@Getter
public class CheckoutResponse {
    private final CartResponse cart;
    private final Integer selectedItemsTotalPrice;

    public CheckoutResponse(CartResponse cart, Integer selectedItemsTotalPrice) {
        this.cart = cart;
        this.selectedItemsTotalPrice = selectedItemsTotalPrice;
    }
}