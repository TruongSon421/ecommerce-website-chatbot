package com.eazybytes.event.model;

import com.eazybytes.dto.CartItemResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReservedEvent implements InventoryEvent {
    private String transactionId;
    private String orderId;
    private List<CartItemResponse> items;
}