package com.eazybytes.dto;

import lombok.Getter;

@Getter
public class CartItemRequest {
    private final String productId;
    private final Integer quantity;
    private final String color;

    public CartItemRequest(String productId, Integer quantity, String color) {
        this.productId = productId;
        this.quantity = quantity;
        this.color = color;
    }
}