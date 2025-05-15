package com.eazybytes.controller;

import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.dto.CartResponse;

import com.eazybytes.dto.CheckoutRequestWrapper;
import com.eazybytes.security.RoleChecker;

import com.eazybytes.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.eazybytes.dto.SagaInitiationResponse;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;

import java.util.List;

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

    @PostMapping("/merge")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<CartResponse> mergeGuestCart(@RequestBody List<CartItemRequest> guestCartItems) {
        String userId = getCurrentUserId();
        log.info("Received cart merge request for user: {} with {} items", userId, guestCartItems.size());
        
        try {
            CartResponse mergedCart = cartService.mergeListItemToCart(userId, guestCartItems);
            return ResponseEntity.ok(mergedCart);
        } catch (CartNotFoundException e) {
            log.error("Cart merge failed for user: {}. Reason: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error during cart merge for user: {}. Reason: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/merge-guest")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<CartResponse> mergeGuestCartToUserCart(@RequestParam String guestId) {
        String userId = getCurrentUserId();
        log.info("Received request to merge guest cart {} into user cart {}", guestId, userId);
        
        try {
            CartResponse mergedCart = cartService.mergeGuestCartToUserCart(userId, guestId);
            return ResponseEntity.ok(mergedCart);
        } catch (CartNotFoundException e) {
            log.error("Cart merge failed. Reason: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (InvalidItemException e) {
            log.error("Cart merge failed. Reason: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Unexpected error during cart merge. Reason: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}