package com.eazybytes.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class CartItemResponse {
    private final String productId;
    private final String productName;
    private final Integer price;
    private final Integer quantity;
    private final String color;
    
    @JsonProperty("available")
    private final boolean available; // Đổi tên từ isAvailable thành available

    public CartItemResponse(String productId, String productName, Integer price, Integer quantity, String color, boolean available) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.color = color;
        this.available = available;
    }   
}