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
@SuperBuilder
public class PaymentSucceededEvent {
    private String transactionId;
    private String orderId;
    private String paymentId;
    private List<CartItemResponse> items;
}