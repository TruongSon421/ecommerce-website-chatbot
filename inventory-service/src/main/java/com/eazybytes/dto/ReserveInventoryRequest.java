package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor  
@AllArgsConstructor
public class ReserveInventoryRequest {
    private String transactionId;
    private String orderId;
    private List<CartItemResponse> items;
    private LocalDateTime reservationExpiresAt; // Thời gian hết hạn giữ hàng
}