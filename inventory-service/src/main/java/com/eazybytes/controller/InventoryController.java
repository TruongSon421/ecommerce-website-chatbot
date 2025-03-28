package com.eazybytes.controller;

import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.VariantDto;
import com.eazybytes.exception.InventoryAlreadyExistsException;
import com.eazybytes.model.ProductInventory;
import com.eazybytes.service.GroupService;
import com.eazybytes.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;
    private final GroupService groupService;

    @GetMapping("/productColorVariants/{productId}")
    public ResponseEntity<List<InventoryDto>> getProductColorVariants(@PathVariable String productId) {
        List<InventoryDto> variants = inventoryService.findAllColorVariantsByProductId(productId);

        if (variants.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(variants);
    }

    @GetMapping("/related/{productId}")
    public ResponseEntity<List<VariantDto>> getRelatedProducts(@PathVariable String productId) {
        log.debug("Received request for related products with productId: {}", productId);

        List<VariantDto> relatedProductIds = groupService.findAllProductsInSameGroup(productId);

        log.debug("Found {} related products for productId: {}", relatedProductIds.size(), productId);
        log.debug("Related product IDs: {}", relatedProductIds);

        return ResponseEntity.ok(relatedProductIds);
    }

    @GetMapping("/product")
    public ResponseEntity<InventoryDto> getProductInventory(
            @RequestParam String productId,
            @RequestParam(required = false) String color) {
        ProductInventory inventory = inventoryService.getProductInventory(productId, color);

        InventoryDto inventoryDto = InventoryDto.builder()
                .productId(inventory.getProductId())
                .color(inventory.getColor())
                .quantity(inventory.getQuantity())
                .originalPrice(inventory.getOriginalPrice())
                .currentPrice(inventory.getCurrentPrice())
                .build();

        return ResponseEntity.ok(inventoryDto);
    }


    @PostMapping("/create")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<InventoryDto> createInventory(@Valid @RequestBody InventoryDto request) {
        log.debug("Received request to create inventory: {}", request);
        try {
            log.debug("Checking if user has ADMIN role");
            // Bạn có thể thêm đoạn code kiểm tra role ở đây để debug

            log.debug("Calling service to create product inventory");
            ProductInventory createdInventory = inventoryService.createInventory(request);
            log.debug("Successfully created inventory with ID: {}", createdInventory.getInventoryId());

            InventoryDto inventoryDto = InventoryDto.builder()
                    .productId(createdInventory.getProductId())
                    .productName(createdInventory.getProductName())
                    .color(createdInventory.getColor())
                    .quantity(createdInventory.getQuantity())
                    .originalPrice(createdInventory.getOriginalPrice())
                    .currentPrice(createdInventory.getCurrentPrice())
                    .build();
            log.debug("Returning created inventory DTO: {}", inventoryDto);

            return new ResponseEntity<>(inventoryDto, HttpStatus.CREATED);
        } catch (InventoryAlreadyExistsException e) {
            log.error("Inventory already exists: {}", e.getMessage());
            log.debug("Request data that caused conflict: {}", request);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new InventoryDto()); // Or return a more descriptive error DTO
        } catch (Exception e) {
            log.error("Error creating inventory: {}", e.getMessage(), e);
            log.debug("Request data that caused error: {}", request);
            log.debug("Stack trace: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new InventoryDto()); // Or return a more descriptive error DTO
        }
    }

    @PutMapping("/update")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<InventoryDto> updateInventory(
            @Valid @RequestBody InventoryDto request) {
        ProductInventory updatedInventory = inventoryService.updateInventory(request);

        InventoryDto inventoryDto = InventoryDto.builder()
                .inventoryId(updatedInventory.getInventoryId())
                .productId(updatedInventory.getProductId())
                .color(updatedInventory.getColor())
                .productName(updatedInventory.getProductName())
                .quantity(updatedInventory.getQuantity())
                .originalPrice(updatedInventory.getOriginalPrice())
                .currentPrice(updatedInventory.getCurrentPrice())
                .build();

        return ResponseEntity.ok(inventoryDto);
    }

    @PostMapping("/decrease")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<InventoryDto> decreaseProductQuantity(
            @RequestParam String productId,
            @RequestParam String color,
            @RequestParam int quantity) {
        ProductInventory updatedInventory = inventoryService.decreaseProductQuantity(productId, color, quantity);

        InventoryDto inventoryDto = InventoryDto.builder()
                .productId(updatedInventory.getProductId())
                .color(updatedInventory.getColor())
                .quantity(updatedInventory.getQuantity())
                .originalPrice(updatedInventory.getOriginalPrice())
                .currentPrice(updatedInventory.getCurrentPrice())
                .build();

        return ResponseEntity.ok(inventoryDto);
    }

    /**
     * Tăng số lượng điện thoại
     */
    @PostMapping("/increase")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<InventoryDto> increaseProductQuantity(
            @RequestParam String productId,
            @RequestParam String color,
            @RequestParam int quantity) {
        ProductInventory updatedInventory = inventoryService.increaseProductQuantity(productId, color, quantity);

        InventoryDto inventoryDto = InventoryDto.builder()
                .inventoryId(updatedInventory.getInventoryId())
                .productId(updatedInventory.getProductId())
                .color(updatedInventory.getColor())
                .quantity(updatedInventory.getQuantity())
                .originalPrice(updatedInventory.getOriginalPrice())
                .currentPrice(updatedInventory.getCurrentPrice())
                .build();

        return ResponseEntity.ok(inventoryDto);
    }


    @DeleteMapping("/delete/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInventoriesByProductId(@PathVariable("productId") String productId) {
        inventoryService.deleteAllByProductId(productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductInventory(@RequestParam("productId") String productId, @RequestParam("color") String color)
    {
        inventoryService.deleteProductInventory(productId,color);
        return ResponseEntity.noContent().build();
    }
}