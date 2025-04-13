package com.eazybytes.cart.event.model;

import com.eazybytes.cart.service.CartItemIdentifier;
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
    private List<CartItemIdentifier> productIdentifiers;
    private String reason;

    public CheckoutFailedEvent(String transactionId, String userId, List<CartItemIdentifier> productIdentifiers, String reason) {
        super(transactionId, userId);
        this.productIdentifiers = productIdentifiers;
        this.reason = reason;
    }
}