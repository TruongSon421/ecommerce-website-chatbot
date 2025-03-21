package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String userId;
    private BigDecimal totalPrice;
    private String shippingAddress;
    private String phoneNumber;
    private String email;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal shippingFee;
    private String notes;
    private String createdAt;
    private String updatedAt;
    private List<OrderItemResponse> items;
}