package com.eazybytes.payment.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;


@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class ProcessPaymentRequest extends BaseSagaEvent {
    private String orderId; 
    private String totalAmount; 
    private String paymentMethod;

    // Constructor nếu cần
    public ProcessPaymentRequest(String transactionId, String userId, String orderId, String totalAmount, String paymentMethod) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
    }
}