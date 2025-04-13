package com.eazybytes.cart.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class CartResponse {
    private final String userId;
    private final String totalPrice;
    private final List<CartItemResponse> items;

    public CartResponse(String userId, String totalPrice, List<CartItemResponse> items) {
        this.userId = userId;
        this.totalPrice = totalPrice;
        this.items = items;
    }
}