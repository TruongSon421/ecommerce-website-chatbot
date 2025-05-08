package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private String productId;
    private String productName;
    private Integer price;
    private int quantity;
    private String color;
    private boolean available;
}
