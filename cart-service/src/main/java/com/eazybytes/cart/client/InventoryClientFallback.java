package com.eazybytes.cart.client;

import com.eazybytes.cart.dto.InventoryDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class InventoryClientFallback implements InventoryClient {

    @Override
    public ResponseEntity<InventoryDto> getProductInventory(String productId, String color) {
        return ResponseEntity.status(503).body(new InventoryDto());
    }

    @Override
    public ResponseEntity<List<InventoryDto>> getProductColorVariants(String productId) {
        return ResponseEntity.status(503).body(List.of());
    }

    @Override
    public ResponseEntity<InventoryDto> createInventory(InventoryDto request) {
        return ResponseEntity.status(503).body(new InventoryDto());
    }

    @Override
    public ResponseEntity<InventoryDto> updateProductInventory(InventoryDto request) {
        return ResponseEntity.status(503).body(new InventoryDto());
    }

    @Override
    public ResponseEntity<Void> deleteInventoriesByProductId(String productId) {
        return ResponseEntity.status(503).build();
    }

    @Override
    public ResponseEntity<Void> deleteProductInventory(String productId, String color) {
        return ResponseEntity.status(503).build();
    }
}