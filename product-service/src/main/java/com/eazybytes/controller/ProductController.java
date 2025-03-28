package com.eazybytes.controller;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.*;
import com.eazybytes.dto.product.ProductRequest;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    private final ProductService productService;
    private final InventoryClient inventoryClient;

    @GetMapping("get/{type}/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse getProduct(@PathVariable String type, @PathVariable String id) {
        return productService.getProductById(type, id);
    }

    @PostMapping("/create")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@RequestBody @Valid ProductWithInventoryRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse updateProduct(
            @PathVariable String id,
            @RequestBody @Valid ProductWithInventoryRequest request) {
        log.debug("Update Request: {}", request);
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable String id) {
        try {
            // Xóa inventory trước
            inventoryClient.deleteInventoriesByProductId(id);
            log.info("Successfully deleted inventories for product ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting inventories for product ID {}: {}", id, e.getMessage());
        }

        // Xóa sản phẩm
        productService.deleteProduct(id);
    }
}