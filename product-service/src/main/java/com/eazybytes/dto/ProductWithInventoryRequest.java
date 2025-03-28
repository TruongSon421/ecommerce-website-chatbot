package com.eazybytes.dto;

import com.eazybytes.dto.product.ProductRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductWithInventoryRequest {
    private ProductRequest productRequest;
    private List<InventoryDto> inventoryRequests;
}