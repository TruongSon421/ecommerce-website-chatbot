package com.eazybytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class OrderResponse {
    private String orderId;
    private String userId;
    private Integer totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private String transactionId;
    private String shippingAddress;
    private String paymentMethod;
    private Integer itemCount;

    // Constructor với 4 tham số cho compatibility với code cũ
    public OrderResponse(String orderId, String userId, Integer totalAmount, String status) {
        this.orderId = orderId;
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    // Constructor với tất cả tham số cho admin functionality
    public OrderResponse(String orderId, String userId, Integer totalAmount, String status, 
                        LocalDateTime createdAt, String transactionId, String shippingAddress, 
                        String paymentMethod, Integer itemCount) {
        this.orderId = orderId;
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.transactionId = transactionId;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.itemCount = itemCount;
    }
}