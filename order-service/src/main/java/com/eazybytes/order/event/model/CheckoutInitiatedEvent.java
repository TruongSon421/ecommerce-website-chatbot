package com.eazybytes.order.event.model;

import com.eazybytes.order.dto.CartItemIdentifier;
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
public class CheckoutInitiatedEvent extends BaseSagaEvent {
    private List<CartItemResponse> cartItems;
    private String shippingAddress;
    private String paymentMethod;
    private List<CartItemIdentifier> selectedItems;

    public CheckoutInitiatedEvent(String transactionId, String userId, List<CartItemResponse> cartItems, 
                                  String shippingAddress, String paymentMethod, List<CartItemIdentifier> selectedItems) {
        super(transactionId, userId);
        this.cartItems = cartItems;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.selectedItems = selectedItems;
    }
}