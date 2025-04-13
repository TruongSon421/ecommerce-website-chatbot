package com.eazybytes.payment.dto;

import com.eazybytes.payment.model.Payment;

import java.util.UUID;

public class PaymentRequest {
    private UUID orderId;
    private String amount;
    private Payment.PaymentMethod paymentMethod; // Thêm paymentMethod

    public PaymentRequest() {}

    public PaymentRequest(UUID orderId, String amount, Payment.PaymentMethod paymentMethod) {
        this.orderId = orderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}