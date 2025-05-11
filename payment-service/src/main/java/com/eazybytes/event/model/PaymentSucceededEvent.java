package com.eazybytes.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSucceededEvent {
    private Long orderId;
    private String paymentId;
    private String amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private LocalDateTime timestamp;
    private String transactionId;
}