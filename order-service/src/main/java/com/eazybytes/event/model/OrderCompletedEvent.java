package com.eazybytes.event.model;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.List;

import com.eazybytes.dto.CartItemResponse;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class OrderCompletedEvent extends BaseSagaEvent {
    private String orderId;
    private String paymentId;
    private List<CartItemResponse> selectedItems;

    public OrderCompletedEvent(String transactionId, String userId, String orderId, String paymentId, List<CartItemResponse> selectedItems) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.selectedItems = selectedItems;
    }
}