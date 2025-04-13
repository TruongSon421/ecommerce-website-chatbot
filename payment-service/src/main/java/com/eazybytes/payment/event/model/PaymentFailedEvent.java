package com.eazybytes.payment.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class PaymentFailedEvent extends BaseSagaEvent {
    private UUID orderId;
    private String reason;

    public PaymentFailedEvent(String transactionId, String userId, UUID orderId, String reason) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.reason = reason;
    }
}