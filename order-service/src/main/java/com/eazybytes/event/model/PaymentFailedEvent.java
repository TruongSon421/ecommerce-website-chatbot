package com.eazybytes.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder
public class PaymentFailedEvent {
    private String transactionId;
    private String orderId;
    private String reason;
}