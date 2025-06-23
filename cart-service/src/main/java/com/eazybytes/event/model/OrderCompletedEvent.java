package com.eazybytes.event.model;

import java.util.List;

import com.eazybytes.service.CartItemIdentifier;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class OrderCompletedEvent extends BaseSagaEvent {
    private List<CartItemIdentifier> selectedItems;
    public OrderCompletedEvent(String transactionId, String userId) {
        super(transactionId, userId);
    }
}