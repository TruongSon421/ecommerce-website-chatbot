package com.eazybytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.eazybytes.dto.CartItemResponse;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailsResponseDto {
    private String id; // Order ID (Primary Key of Order table)
    private String transactionId; // The transaction ID from the saga/cart service
    private String userId;
    private List<CartItemResponse> items;
    private Integer totalAmount; // Using BigDecimal for precision
    private String shippingAddress;
    private String paymentMethod;
    private String status;
    // Optional: Add other fields like createdAt, updatedAt if needed by frontend
    // private String createdAt;
} 