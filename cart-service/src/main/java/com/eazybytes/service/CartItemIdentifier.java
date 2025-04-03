package com.eazybytes.service;

public class CartItemIdentifier {
    private String productId;
    private String color;

    public CartItemIdentifier(String productId, String color) {
        this.productId = productId;
        this.color = color;
    }

    public String getProductId() {
        return productId;
    }

    public String getColor() {
        return color;
    }
}
