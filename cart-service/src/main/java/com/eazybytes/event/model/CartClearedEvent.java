package com.eazybytes.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class CartClearedEvent extends BaseSagaEvent {
    public CartClearedEvent(String transactionId, String userId) {
        super(transactionId, userId);
    }
}