package com.eazybytes.event.model;

import com.eazybytes.model.Payment.PaymentMethod;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class ProcessPaymentRequest extends BaseSagaEvent {
    private Long orderId;
    private Integer totalAmount;
    private PaymentMethod paymentMethod;
    private String clientIpAddress;

    public ProcessPaymentRequest(String transactionId, String userId, Long orderId, Integer totalAmount, PaymentMethod paymentMethod) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
    }
    
    public ProcessPaymentRequest(String transactionId, String userId, Long orderId, Integer totalAmount, PaymentMethod paymentMethod, String clientIpAddress) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.clientIpAddress = clientIpAddress;
    }
}