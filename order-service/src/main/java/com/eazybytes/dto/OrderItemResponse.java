package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private String productId;
    private String productType;
    private String productName;
    private String color;
    private String storage;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}