package com.eazybytes.dto;

import lombok.Getter;


import java.util.List;

@Getter
public class CartResponse {
    private final String userId;
    private final Integer totalPrice;
    private final List<CartItemResponse> items;

    public CartResponse(String userId, Integer totalPrice, List<CartItemResponse> items) {
        this.userId = userId;
        this.totalPrice = totalPrice;
        this.items = items;
    }
}