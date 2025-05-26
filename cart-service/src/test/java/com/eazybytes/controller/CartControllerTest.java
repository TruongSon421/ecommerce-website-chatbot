package com.eazybytes.controller;

import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.dto.CartResponse;
import com.eazybytes.dto.CheckoutRequest;
import com.eazybytes.dto.SagaInitiationResponse;
import com.eazybytes.service.CartService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CartService cartService;

    private CartResponse cartResponse;
    private CartItemRequest cartItemRequest;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        cartResponse = new CartResponse("user123", 100, Collections.emptyList());
        cartItemRequest = new CartItemRequest("prod1", 2, "red");
        checkoutRequest = new CheckoutRequest("user123", "123 Main St", "credit_card");
    }

    @Test
    @WithMockUser(username = "user123")
    void getCartByUserId_Success() throws Exception {
        when(cartService.getCartByUserId("user123")).thenReturn(cartResponse);

        mockMvc.perform(get("/cart")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"))
                .andExpect(jsonPath("$.totalPrice").value(100));
    }

    @Test
    @WithMockUser(username = "user123")
    void addItemToCart_Success() throws Exception {
        when(cartService.addItemToCart(any(), any())).thenReturn(cartResponse);

        mockMvc.perform(post("/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cartItemRequest))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser(username = "user123")
    void updateCartItem_Success() throws Exception {
        when(cartService.updateCartItem(any(), any(), any(), any())).thenReturn(cartResponse);

        mockMvc.perform(put("/cart/update/prod1")
                .param("quantity", "3")
                .param("color", "blue")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser(username = "user123")
    void removeItemFromCart_Success() throws Exception {
        when(cartService.removeItemFromCart(any(), any(), any())).thenReturn(cartResponse);

        mockMvc.perform(delete("/cart/remove/prod1")
                .param("color", "red")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser(username = "user123")
    void clearCart_Success() throws Exception {
        mockMvc.perform(delete("/cart/clear")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user123")
    void initiateCheckoutSaga_Success() throws Exception {
        SagaInitiationResponse sagaResponse = new SagaInitiationResponse("tx123", "Checkout initiated");
        when(cartService.initiateCheckoutSaga(any(), any())).thenReturn(sagaResponse);

        mockMvc.perform(post("/cart/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkoutRequest))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("tx123"));
    }

    @Test
    @WithMockUser
    void createCart_Success() throws Exception {
        when(cartService.createCart(any())).thenReturn(cartResponse);

        mockMvc.perform(post("/cart/create")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser
    void createGuestCart_Success() throws Exception {
        when(cartService.createGuestCart(any())).thenReturn(cartResponse);

        mockMvc.perform(post("/cart/guest/create")
                .param("guestId", "guest123")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser
    void getGuestCartById_Success() throws Exception {
        when(cartService.getGuestCartById(any())).thenReturn(cartResponse);

        mockMvc.perform(get("/cart/guest/guest123")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser
    void addItemToGuestCart_Success() throws Exception {
        when(cartService.addItemToGuestCart(any(), any())).thenReturn(cartResponse);

        mockMvc.perform(post("/cart/guest/add")
                .param("guestId", "guest123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cartItemRequest))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser
    void updateGuestCartItem_Success() throws Exception {
        when(cartService.updateGuestCartItem(any(), any(), any(), any())).thenReturn(cartResponse);

        mockMvc.perform(put("/cart/guest/update/prod1")
                .param("guestId", "guest123")
                .param("quantity", "3")
                .param("color", "blue")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser
    void removeItemFromGuestCart_Success() throws Exception {
        when(cartService.removeItemFromGuestCart(any(), any(), any())).thenReturn(cartResponse);

        mockMvc.perform(delete("/cart/guest/remove/prod1")
                .param("guestId", "guest123")
                .param("color", "red")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }

    @Test
    @WithMockUser
    void mergeGuestCartToUserCart_Success() throws Exception {
        when(cartService.mergeGuestCartToUserCart(any(), any())).thenReturn(cartResponse);

        mockMvc.perform(post("/cart/merge")
                .param("guestId", "guest123")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user123"));
    }
}
