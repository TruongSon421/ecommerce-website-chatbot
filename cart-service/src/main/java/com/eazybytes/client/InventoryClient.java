package com.eazybytes.client;

import com.eazybytes.config.FeignClientConfig;
import com.eazybytes.dto.InventoryDto;

import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@FeignClient(name = "inventory-service", 
    configuration = FeignClientConfig.class, 
    fallback = InventoryClientFallback.class)
public interface InventoryClient {

    @GetMapping("/api/inventory/product")
    ResponseEntity<InventoryDto> getProductInventory(@RequestParam String productId, @RequestParam(required = false) String color);

    @GetMapping("/api/inventory/productColorVariants/{productId}")
    ResponseEntity<List<InventoryDto>> getProductColorVariants(@PathVariable String productId);

    @PostMapping("/api/inventory")
    ResponseEntity<InventoryDto> createInventory(@Valid @RequestBody InventoryDto request);

    @PutMapping("/api/inventory/product")
    ResponseEntity<InventoryDto> updateProductInventory(@Valid @RequestBody InventoryDto request);

    @DeleteMapping("/api/inventory/delete/{productId}")
    ResponseEntity<Void> deleteInventoriesByProductId(@PathVariable("productId") String productId);

    @DeleteMapping("/delete")
    ResponseEntity<Void> deleteProductInventory(@RequestParam("productId") String productId, @RequestParam("color") String color);
}