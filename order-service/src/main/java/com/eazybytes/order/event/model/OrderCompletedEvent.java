package com.eazybytes.order.event.model;


import com.eazybytes.order.dto.CartItemResponse;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.List;

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