package com.eazybytes.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class PaymentSucceededEvent extends BaseSagaEvent {
    private Long orderId;
    private String paymentId;
    private String amount;

    public PaymentSucceededEvent(String transactionId, String userId, Long orderId, String paymentId, String amount) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.amount = amount;
    }
}