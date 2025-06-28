package com.eazybytes.controller;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.*;
import com.eazybytes.dto.product.ProductRequest;
import com.eazybytes.dto.product.ProductResponse;
import com.eazybytes.model.BaseProduct;
import com.eazybytes.service.ProductService;
import com.eazybytes.service.ProductReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    private final ProductService productService;
    private final InventoryClient inventoryClient;
    private final ProductReviewService reviewService;

    @GetMapping("/get/{type}/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponse getProduct(@PathVariable String type, @PathVariable String id) {
        ProductResponse product = productService.getProductById(type, id);
        // Thêm thống kê đánh giá vào response
        Map<String, Object> reviewStats = reviewService.getProductReviewStats(id);
        // Có thể extend ProductResponse để include reviewStats hoặc trả về Map
        return product;
    }

    @GetMapping("/get/{type}/{id}/with-reviews")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> getProductWithReviews(@PathVariable String type, @PathVariable String id) {
        ProductResponse product = productService.getProductById(type, id);
        Map<String, Object> reviewStats = reviewService.getProductReviewStats(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("product", product);
        response.put("reviewStats", reviewStats);
        return response;
    }

    @PostMapping("/create")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@RequestBody @Valid ProductWithInventoryRequest request) {
        return productService.createProduct(request);
    }

    @PostMapping("/create-bulk-group")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public BulkGroupCreateResponse createBulkProductGroup(@RequestBody @Valid BulkGroupCreateRequest request) {
        return productService.createBulkProductGroup(request);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public BaseProduct updateProduct(
            @PathVariable String id,
            @RequestBody @Valid ProductRequest productRequest) {
        log.debug("Update Request: {}", productRequest);
        return productService.updateProduct(id, productRequest);
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

        try {
            // Xóa liên kết GroupProduct
            inventoryClient.deleteGroupProductByProductId(id);
            log.info("Successfully deleted group-product link for product ID: {}", id);
        } catch (Exception e) {
            log.error("Error deleting group-product link for product ID {}: {}", id, e.getMessage());
        }

        // Xóa sản phẩm
        productService.deleteProduct(id);
        log.info("Successfully deleted product ID: {}", id);
    }

    @DeleteMapping("/delete-group")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT) // đã  xử lý logic xóa cả group
    public ResponseEntity<?> deleteProductGroup(@RequestBody DeleteGroupDto request) {
        try {
            DeleteGroupDto response = productService.deleteProductGroup(request);
            log.info("Successfully deleted product group ID: {} with {} products", 
                    request.getGroupId(), request.getProductIds().size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting product group ID {}: {}", request.getGroupId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete product group: " + e.getMessage()));
        }
    }

}