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
public class OrderCreatedEvent extends BaseSagaEvent {
    private String orderId;
    private List<CartItemIdentifier> productIdentifiers;
    private String totalAmount;
    private String shippingAddress;
    private String paymentMethod;
    private List<CartItemIdentifier> selectedItems;

    public OrderCreatedEvent(String transactionId, String userId, String orderId, List<CartItemIdentifier> productIdentifiers,
                             String totalAmount, String shippingAddress, String paymentMethod, List<CartItemIdentifier> selectedItems) {
        super(transactionId, userId);
        this.orderId = orderId;
        this.productIdentifiers = productIdentifiers;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.selectedItems = selectedItems;
    }
}