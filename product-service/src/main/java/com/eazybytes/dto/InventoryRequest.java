package com.eazybytes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class InventoryRequest{
    @NotBlank(message = "Product variant cannot be blank")
    private String variant;

    @NotBlank(message = "Product color cannot be blank")
    private String color;

    private Integer quantity;

    private String originalPrice;

    private String currentPrice;

}