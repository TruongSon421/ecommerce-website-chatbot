package com.eazybytes.dto;

import java.util.UUID;

public class PaymentRequest {
    private UUID orderId;
    private String amount; // Thay BigDecimal thành String

    public PaymentRequest(UUID orderId, String amount) {
        this.orderId = orderId;
        this.amount = amount;
    }

    public UUID getOrderId() { return orderId; }
    public String getAmount() { return amount; }
}