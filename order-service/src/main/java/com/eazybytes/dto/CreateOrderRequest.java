package com.eazybytes.dto;

public class CreateOrderRequest {
    private String userId;
    private String shippingAddress;

    // Constructor
    public CreateOrderRequest() {}

    public CreateOrderRequest(String userId, String shippingAddress) {
        this.userId = userId;
        this.shippingAddress = shippingAddress;
    }

    // Getters và Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}