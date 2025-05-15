package com.eazybytes.controller;

import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.dto.CartResponse;
import com.eazybytes.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/guest-carts")
@RequiredArgsConstructor
@Slf4j
public class GuestCartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartResponse> createGuestCart() {
        // Tạo ID ngẫu nhiên cho khách vãng lai
        String guestId = "guest-" + UUID.randomUUID().toString();
        log.info("Creating new guest cart with ID: {}", guestId);
        return ResponseEntity.ok(cartService.createGuestCart(guestId));
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<CartResponse> getGuestCart(@PathVariable String guestId) {
        try {
            return ResponseEntity.ok(cartService.getGuestCartById(guestId));
        } catch (Exception e) {
            log.error("Error fetching guest cart: {}", guestId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{guestId}/items")
    public ResponseEntity<CartResponse> addItemToGuestCart(
            @PathVariable String guestId,
            @RequestBody CartItemRequest cartItem) {
        try {
            return ResponseEntity.ok(cartService.addItemToGuestCart(guestId, cartItem));
        } catch (Exception e) {
            log.error("Error adding item to guest cart: {}", guestId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{guestId}/items/{productId}")
    public ResponseEntity<CartResponse> updateGuestCartItem(
            @PathVariable String guestId,
            @PathVariable String productId,
            @RequestParam Integer quantity,
            @RequestParam String color) {
        try {
            return ResponseEntity.ok(cartService.updateGuestCartItem(guestId, productId, quantity, color));
        } catch (Exception e) {
            log.error("Error updating guest cart item: {}", guestId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{guestId}/items/{productId}")
    public ResponseEntity<CartResponse> removeItemFromGuestCart(
            @PathVariable String guestId,
            @PathVariable String productId,
            @RequestParam String color) {
        try {
            return ResponseEntity.ok(cartService.removeItemFromGuestCart(guestId, productId, color));
        } catch (Exception e) {
            log.error("Error removing item from guest cart: {}", guestId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{guestId}")
    public ResponseEntity<Void> clearGuestCart(@PathVariable String guestId) {
        try {
            cartService.clearGuestCart(guestId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error clearing guest cart: {}", guestId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
} 