package com.eazybytes.client;

import com.eazybytes.config.FeignClientConfig;
import com.eazybytes.dto.InventoryDto;
import jakarta.validation.Valid;
import jakarta.ws.rs.PathParam;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "inventory-service",
        url = "${inventory-service.url}",
        configuration = FeignClientConfig.class)
public interface InventoryClient {

    @GetMapping("/api/inventory/product")
    ResponseEntity<InventoryDto> getInventory(@RequestParam String productId, @RequestParam(required = false) String color);

    @GetMapping("/api/inventory/productColorVariants/{productId}")
    ResponseEntity<List<InventoryDto>> getProductColorVariants(@PathVariable String productId);

    @PostMapping("/api/inventory/create")
    ResponseEntity<InventoryDto> createInventory(@Valid @RequestBody InventoryDto request);

    @DeleteMapping("/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    void deleteInventory(@RequestParam("productId") String productId, @RequestParam("color") String color);

    @PutMapping("/api/inventory/update")
    ResponseEntity<InventoryDto> updateInventory(@RequestParam("inventoryId") Integer inventoryId, @Valid @RequestBody InventoryDto request);

    @DeleteMapping("/api/inventory/delete/{productId}")
    void  deleteInventoriesByProductId(@PathVariable("productId") String productId);

    @DeleteMapping("/api/inventory/products/batch")
    void deleteInventoriesByProductIds(@RequestBody List<String> productIds);

    @DeleteMapping("/api/inventory/delete")
    void  deleteProductInventory(@RequestParam("productId") String productId, @RequestParam("color") String color);

    @DeleteMapping("/api/group-variants/group-product/product/{productId}")
    void  deleteGroupProductByProductId(@PathVariable String productId);

    @DeleteMapping("/api/group-variants/group-product/group/{groupId}")
    void deleteGroupProductsByGroupId(@PathVariable Integer groupId);
}