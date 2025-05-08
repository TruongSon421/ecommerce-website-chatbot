package com.eazybytes.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFailedEvent {
    private Long orderId;
    private String errorCode;
    private String errorMessage;
    private String amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private LocalDateTime timestamp;
}