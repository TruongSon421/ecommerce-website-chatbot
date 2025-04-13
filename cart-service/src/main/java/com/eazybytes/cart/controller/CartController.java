package com.eazybytes.cart.controller;

import com.eazybytes.cart.dto.CartItemRequest;
import com.eazybytes.cart.dto.CartResponse;

import com.eazybytes.cart.dto.CheckoutRequestWrapper;
import com.eazybytes.cart.security.RoleChecker;

import com.eazybytes.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.eazybytes.cart.dto.SagaInitiationResponse;
import com.eazybytes.cart.exception.CartNotFoundException;
import com.eazybytes.cart.exception.InvalidItemException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;
    private final RoleChecker roleChecker; 
    private String getCurrentUserId() {
        return roleChecker.getCurrentUserId();
    }

    @GetMapping
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<CartResponse> getCart() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PostMapping("/items")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<CartResponse> addItemToCart(@RequestBody CartItemRequest cartItem) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.addItemToCart(userId, cartItem));
    }

    @PutMapping("/items/{productId}")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable String productId,
            @RequestParam Integer quantity,
            @RequestParam String color) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.updateCartItem(userId, productId, quantity, color));
    }

    @DeleteMapping("/items/{productId}")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @PathVariable String productId,
            @RequestParam String color) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, productId, color));
    }

    @DeleteMapping
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<Void> clearCart() {
        String userId = getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/checkout")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<SagaInitiationResponse> initiateCheckout(@RequestBody CheckoutRequestWrapper wrapper) {
        try {
            log.info("Received checkout request for user: {}", wrapper.getCheckoutRequest().getUserId());
            SagaInitiationResponse response = cartService.initiateCheckoutSaga(wrapper.getCheckoutRequest(), wrapper.getSelectedItems());
            return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
        } catch (CartNotFoundException | InvalidItemException e) {
            log.error("Checkout failed for user: {}. Reason: {}", wrapper.getCheckoutRequest().getUserId(), e.getMessage());
            return new ResponseEntity<>(new SagaInitiationResponse(null, e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Unexpected error during checkout for user: {}. Reason: {}", wrapper.getCheckoutRequest().getUserId(), e.getMessage());
            return new ResponseEntity<>(new SagaInitiationResponse(null, "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}