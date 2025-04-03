package com.eazybytes.controller;

import com.eazybytes.dto.CartResponse;
import com.eazybytes.dto.CheckoutResponse;
import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.service.CartItemIdentifier;
import com.eazybytes.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<CartResponse> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PostMapping("/{userId}/items")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<CartResponse> addItemToCart(
            @PathVariable String userId,
            @RequestBody CartItemRequest cartItem) {
        return ResponseEntity.ok(cartService.addItemToCart(userId, cartItem));
    }

    @PutMapping("/{userId}/items/{productId}")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable String userId,
            @PathVariable String productId,
            @RequestParam Integer quantity,
            @RequestParam String color) {
        return ResponseEntity.ok(cartService.updateCartItem(userId, productId, quantity, color));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @PathVariable String userId,
            @RequestParam String productId,
            @RequestParam String color) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, productId, color));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/checkout")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<Void> checkoutCart(@PathVariable String userId) {
        cartService.checkoutCart(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/checkout-selected")
    @PreAuthorize("@roleChecker.hasRole('USER') and @roleChecker.hasAccessToUserId(#userId)")
    public ResponseEntity<CheckoutResponse> checkoutSelectedItems(
            @PathVariable String userId,
            @RequestBody List<CartItemIdentifier> selectedItems) {
        return ResponseEntity.ok(cartService.checkoutSelectedItems(userId, selectedItems));
    }
}