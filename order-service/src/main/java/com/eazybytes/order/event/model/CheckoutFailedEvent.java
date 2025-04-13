package com.eazybytes.order.event.model;

import com.eazybytes.order.dto.CartItemIdentifier;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class CheckoutFailedEvent extends BaseSagaEvent {
    private String orderId;
    private List<CartItemIdentifier> productIdentifiers;
    private String reason;

    public CheckoutFailedEvent(String transactionId, String userId, String orderId, List<CartItemIdentifier> productIdentifiers, String reason) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.productIdentifiers = productIdentifiers;
        this.reason = reason;
    }
}