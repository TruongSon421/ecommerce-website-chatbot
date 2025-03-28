package com.eazybytes.controller;

import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import com.eazybytes.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/carts")
@PreAuthorize("@roleChecker.hasRole('USER')")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<Cart> addItemToCart(@PathVariable String userId, @RequestBody CartItems cartItem) {
        return new ResponseEntity<>(cartService.addItemToCart(userId, cartItem), HttpStatus.CREATED);
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> updateCartItem(
            @PathVariable String userId,
            @PathVariable String productId,
            @RequestParam Integer quantity,
            @RequestParam String color) {
        return ResponseEntity.ok(cartService.updateCartItem(userId, productId, quantity,color));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> removeItemFromCart(
            @PathVariable String userId,
            @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, productId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/checkout")
    public ResponseEntity<Void> checkoutCart(@PathVariable String userId) {
        cartService.checkoutCart(userId);
        return ResponseEntity.ok().build();
    }
}

