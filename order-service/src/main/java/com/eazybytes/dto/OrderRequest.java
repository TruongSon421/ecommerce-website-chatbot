package com.eazybytes.dto;

import com.eazybytes.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotBlank(message = "User ID không được để trống")
    private String userId;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    private String email;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    private BigDecimal shippingFee;

    private String notes;

    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    @Valid
    private List<OrderItemRequest> items;
}