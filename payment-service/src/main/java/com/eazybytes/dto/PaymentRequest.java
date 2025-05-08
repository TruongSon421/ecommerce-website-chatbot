package com.eazybytes.dto;

import java.util.UUID;

import com.eazybytes.model.Payment;

public class PaymentRequest {
    private Long orderId;
    private String amount;
    private Payment.PaymentMethod paymentMethod; // Thêm paymentMethod

    public PaymentRequest() {}

    public PaymentRequest(Long orderId, String amount, Payment.PaymentMethod paymentMethod) {
        this.orderId = orderId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
}