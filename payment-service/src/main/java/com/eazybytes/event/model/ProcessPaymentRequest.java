package com.eazybytes.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {
    private String orderId;
    private String transactionId;
    private String userId;
    private Integer totalAmount;
    private String currency;
    private String paymentMethod;
}