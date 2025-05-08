package com.eazybytes.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.util.List;

import com.eazybytes.dto.CartItemIdentifier;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class OrderCreatedEvent extends BaseSagaEvent {
    private String orderId;
    private List<CartItemIdentifier> productIdentifiers;
    private Integer totalAmount;
    private String shippingAddress;
    private String paymentMethod;
    private List<CartItemIdentifier> selectedItems;

    public OrderCreatedEvent(String transactionId, String userId, String orderId, List<CartItemIdentifier> productIdentifiers,
                             Integer totalAmount, String shippingAddress, String paymentMethod, List<CartItemIdentifier> selectedItems) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.productIdentifiers = productIdentifiers;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.selectedItems = selectedItems;
    }
}