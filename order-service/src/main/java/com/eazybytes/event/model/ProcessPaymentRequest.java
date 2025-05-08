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
public class ProcessPaymentRequest {
    private String transactionId;
    private String userId;
    private String orderId;
    private Integer totalAmount;
    private String paymentMethod;
    private List<CartItemResponse> items;
}