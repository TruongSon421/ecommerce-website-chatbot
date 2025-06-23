package com.eazybytes.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class CartClearFailedEvent extends BaseSagaEvent {
    private String reason;

    public CartClearFailedEvent(String transactionId, String userId, String reason) {
        super(transactionId, userId);
        this.reason = reason;
    }
}