package com.eazybytes.order.dto;

import java.util.List;

public class OrderConfirmationNotification {
    private String userId;
    private List<CartItemIdentifier> items;

    public OrderConfirmationNotification(String userId, List<CartItemIdentifier> items) {
        this.userId = userId;
        this.items = items;
    }

    public String getUserId() { return userId; }
    public List<CartItemIdentifier> getItems() { return items; }
}