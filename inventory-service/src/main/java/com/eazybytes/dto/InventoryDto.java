package com.eazybytes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class InventoryDto {
    private Integer inventoryId;

    @NotBlank(message = "Product ID cannot be blank")
    private String productId;

    private String productName;

    private String color;

    private Integer quantity;

    private String originalPrice;

    private String currentPrice;

}