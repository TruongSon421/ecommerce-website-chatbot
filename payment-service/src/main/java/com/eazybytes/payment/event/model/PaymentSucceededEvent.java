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
public class PaymentSucceededEvent extends BaseSagaEvent {
    private UUID orderId;
    private String paymentId; // ID của giao dịch thanh toán được tạo ra

    public PaymentSucceededEvent(String transactionId, String userId, UUID orderId, String paymentId) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.paymentId = paymentId;
    }
}