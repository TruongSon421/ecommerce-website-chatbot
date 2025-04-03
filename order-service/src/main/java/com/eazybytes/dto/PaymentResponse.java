package com.eazybytes.dto;

import java.util.UUID;

public class PaymentResponse {
    private UUID orderId;
    private String paymentId;
    private String status; // PAYMENT_SUCCESS, PAYMENT_FAILED, v.v.

    public PaymentResponse(UUID orderId, String paymentId, String status) {
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.status = status;
    }

    public UUID getOrderId() { return orderId; }
    public String getPaymentId() { return paymentId; }
    public String getStatus() { return status; }
}