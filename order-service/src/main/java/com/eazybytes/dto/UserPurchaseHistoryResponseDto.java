package com.eazybytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPurchaseHistoryResponseDto {
    private String orderId;
    private String transactionId;
    private List<CartItemResponse> items;
    private Integer totalAmount;
    private String status;
    private String paymentMethod;
    private String shippingAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor để mapping từ Order entity
    public UserPurchaseHistoryResponseDto(String orderId, String transactionId, 
                                        Integer totalAmount, String status, 
                                        String paymentMethod, String shippingAddress,
                                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.orderId = orderId;
        this.transactionId = transactionId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.shippingAddress = shippingAddress;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
} 