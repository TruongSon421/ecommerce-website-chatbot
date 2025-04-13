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
@SuperBuilder
public class PaymentSucceededEvent {
    private String transactionId;
    private String orderId;
    private String paymentId;
    private List<CartItemResponse> items;
}