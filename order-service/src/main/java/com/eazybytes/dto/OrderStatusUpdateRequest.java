package com.eazybytes.dto;

import com.eazybytes.model.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateRequest {
    @NotBlank(message = "Order number không được để trống")
    private String orderNumber;

    @NotNull(message = "Status không được để trống")
    private OrderStatus status;
}