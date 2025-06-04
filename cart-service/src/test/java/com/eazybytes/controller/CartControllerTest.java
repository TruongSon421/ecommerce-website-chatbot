package com.eazybytes.controller;

import com.eazybytes.config.TestConfig;
import com.eazybytes.dto.*;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;
import com.eazybytes.security.RoleChecker;
import com.eazybytes.service.CartService;
import com.eazybytes.service.CartItemIdentifier;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
@ActiveProfiles("test")
@Import(TestConfig.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @MockBean
    private RoleChecker roleChecker;

    @Autowired
    private ObjectMapper objectMapper;

    private CartResponse testCartResponse;
    private CartItemRequest testCartItemRequest;

    @BeforeEach
    void setUp() {
        List<CartItemResponse> items = new ArrayList<>();
        items.add(new CartItemResponse("product1", "Test Product", 1000, 2, "red", true));
        
        testCartResponse = new CartResponse("testUser", 2000, items);
        testCartItemRequest = new CartItemRequest("product1", 2, "red");

        when(roleChecker.hasRole("USER")).thenReturn(true);
        when(roleChecker.getCurrentUserId()).thenReturn("testUser");
    }

    @Test
    @WithMockUser
    void testGetCart() throws Exception {
        // Given
        when(cartService.getCartByUserId("testUser")).thenReturn(testCartResponse);

        // When & Then
        mockMvc.perform(get("/api/carts")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value("testUser"))
                .andExpect(jsonPath("$.totalPrice").value(2000))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].productId").value("product1"));

        verify(cartService).getCartByUserId("testUser");
    }

    @Test
    @WithMockUser
    void testAddItemToCart() throws Exception {
        // Given
        when(cartService.addItemToCart(eq("testUser"), any(CartItemRequest.class)))
                .thenReturn(testCartResponse);

        // When & Then
        mockMvc.perform(post("/api/carts/items")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCartItemRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value("testUser"))
                .andExpect(jsonPath("$.totalPrice").value(2000));

        verify(cartService).addItemToCart(eq("testUser"), any(CartItemRequest.class));
    }

    @Test
    @WithMockUser
    void testUpdateCartItem() throws Exception {
        // Given
        when(cartService.updateCartItem("testUser", "product1", 5, "red"))
                .thenReturn(testCartResponse);

        // When & Then
        mockMvc.perform(put("/api/carts/items/product1")
                .with(csrf())
                .param("quantity", "5")
                .param("color", "red"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value("testUser"));

        verify(cartService).updateCartItem("testUser", "product1", 5, "red");
    }

    @Test
    @WithMockUser
    void testRemoveItemFromCart() throws Exception {
        // Given
        when(cartService.removeItemFromCart("testUser", "product1", "red"))
                .thenReturn(testCartResponse);

        // When & Then
        mockMvc.perform(delete("/api/carts/items/product1")
                .with(csrf())
                .param("color", "red"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value("testUser"));

        verify(cartService).removeItemFromCart("testUser", "product1", "red");
    }

    @Test
    @WithMockUser
    void testClearCart() throws Exception {
        // Given
        doNothing().when(cartService).clearCart("testUser");

        // When & Then
        mockMvc.perform(delete("/api/carts")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(cartService).clearCart("testUser");
    }

    @Test
    @WithMockUser
    void testMergeGuestCart() throws Exception {
        // Given
        List<CartItemRequest> guestItems = List.of(testCartItemRequest);
        when(cartService.mergeListItemToCart(eq("testUser"), anyList()))
                .thenReturn(testCartResponse);

        // When & Then
        mockMvc.perform(post("/api/carts/merge")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(guestItems)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value("testUser"));

        verify(cartService).mergeListItemToCart(eq("testUser"), anyList());
    }

    @Test
    @WithMockUser
    void testMergeGuestCartToUserCart() throws Exception {
        // Given
        when(cartService.mergeGuestCartToUserCart("testUser", "guest123"))
                .thenReturn(testCartResponse);

        // When & Then
        mockMvc.perform(post("/api/carts/merge-guest")
                .with(csrf())
                .param("guestId", "guest123"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.userId").value("testUser"));

        verify(cartService).mergeGuestCartToUserCart("testUser", "guest123");
    }

    @Test
    @WithMockUser
    void testAddItemToCart_InvalidItem() throws Exception {
        // Given
        when(cartService.addItemToCart(eq("testUser"), any(CartItemRequest.class)))
                .thenThrow(new InvalidItemException("Invalid item"));

        // When & Then
        mockMvc.perform(post("/api/carts/items")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCartItemRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void testGetCart_CartNotFound() throws Exception {
        // Given
        when(cartService.getCartByUserId("testUser"))
                .thenThrow(new CartNotFoundException("Cart not found"));

        // When & Then
        mockMvc.perform(get("/api/carts")
                .with(csrf()))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser
    void testMergeGuestCart_CartNotFound() throws Exception {
        // Given
        List<CartItemRequest> guestItems = List.of(testCartItemRequest);
        when(cartService.mergeListItemToCart(eq("testUser"), anyList()))
                .thenThrow(new CartNotFoundException("Cart not found"));

        // When & Then
        mockMvc.perform(post("/api/carts/merge")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(guestItems)))
                .andExpect(status().isBadRequest());

        verify(cartService).mergeListItemToCart(eq("testUser"), anyList());
    }

    @Test
    @WithMockUser
    void testMergeGuestCartToUserCart_InvalidItem() throws Exception {
        // Given
        when(cartService.mergeGuestCartToUserCart("testUser", "guest123"))
                .thenThrow(new InvalidItemException("Invalid item"));

        // When & Then
        mockMvc.perform(post("/api/carts/merge-guest")
                .with(csrf())
                .param("guestId", "guest123"))
                .andExpect(status().isBadRequest());

        verify(cartService).mergeGuestCartToUserCart("testUser", "guest123");
    }

    @Test
    @WithMockUser
    void testInitiateCheckout() throws Exception {
        // Given
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        List<CartItemIdentifier> selectedItems = new ArrayList<>();
        CheckoutRequestWrapper wrapper = new CheckoutRequestWrapper();
        wrapper.setCheckoutRequest(checkoutRequest);
        wrapper.setSelectedItems(selectedItems);
        
        SagaInitiationResponse sagaResponse = new SagaInitiationResponse("saga123", "Success");
        when(cartService.initiateCheckoutSaga(any(CheckoutRequest.class), anyList()))
                .thenReturn(sagaResponse);

        // When & Then
        mockMvc.perform(post("/api/carts/checkout")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrapper)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.sagaId").value("saga123"))
                .andExpect(jsonPath("$.message").value("Success"));

        verify(cartService).initiateCheckoutSaga(any(CheckoutRequest.class), anyList());
    }

    @Test
    @WithMockUser
    void testInitiateCheckout_CartNotFound() throws Exception {
        // Given
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        List<CartItemIdentifier> selectedItems = new ArrayList<>();
        CheckoutRequestWrapper wrapper = new CheckoutRequestWrapper();
        wrapper.setCheckoutRequest(checkoutRequest);
        wrapper.setSelectedItems(selectedItems);
        
        when(cartService.initiateCheckoutSaga(any(CheckoutRequest.class), anyList()))
                .thenThrow(new CartNotFoundException("Cart not found"));

        // When & Then
        mockMvc.perform(post("/api/carts/checkout")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrapper)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cart not found"));

        verify(cartService).initiateCheckoutSaga(any(CheckoutRequest.class), anyList());
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/carts"))
                .andExpect(status().isUnauthorized());
    }
} 