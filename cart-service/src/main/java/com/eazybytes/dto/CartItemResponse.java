package com.eazybytes.dto;


import lombok.Getter;

@Getter
public class CartItemResponse {
    private final String productId;
    private final String productName;
    private final Integer price;
    private final Integer quantity;
    private final String color;
    private final boolean isAvailable; // Thêm trạng thái tồn kho

    public CartItemResponse(String productId, String productName, Integer price, Integer quantity, String color, boolean isAvailable) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.color = color;
        this.isAvailable = isAvailable;
    }   
}