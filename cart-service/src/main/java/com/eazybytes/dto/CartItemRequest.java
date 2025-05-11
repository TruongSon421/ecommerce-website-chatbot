package com.eazybytes.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequest {
    private final String productId;
    private final Integer quantity;
    private final String color;
    // Constructor
    public CartItemRequest() {
        this.productId = null;
        this.quantity = null;
        this.color = null;
    }
    // Constructor with parameters
    public CartItemRequest(String productId, Integer quantity, String color) {
        this.productId = productId;
        this.quantity = quantity;
        this.color = color;
    }
}