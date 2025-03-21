package com.eazybytes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jetbrains.annotations.NotNull;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {
    @NotBlank(message = "Product ID không được để trống")
    private String productId;

    @NotBlank(message = "Loại sản phẩm không được để trống")
    private String productType; // "PHONE" hoặc "LAPTOP"

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @NotBlank(message = "Màu sắc không được để trống")
    private String color;

    private String storage; // Chỉ áp dụng cho điện thoại

    @NotNull("Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @NotNull("Đơn giá không được để trống")
    @Min(value = 0, message = "Đơn giá không được âm")
    private BigDecimal unitPrice;
}