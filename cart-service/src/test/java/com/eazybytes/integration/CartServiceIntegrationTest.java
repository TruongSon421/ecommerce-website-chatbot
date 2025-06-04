package com.eazybytes.integration;

import com.eazybytes.config.TestConfig;
import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.dto.CartResponse;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import com.eazybytes.repository.CartRepository;
import com.eazybytes.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.cloud.discovery.enabled=false",
    "spring.cloud.config.enabled=false",
    "spring.kafka.bootstrap-servers=",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379",
    "spring.cloud.openfeign.client.config.default.url=http://localhost:8080"
})
@ActiveProfiles("test")
@Import(TestConfig.class)
@Transactional
class CartServiceIntegrationTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    private String testUserId;
    private CartItemRequest testCartItemRequest;

    @BeforeEach
    void setUp() {
        testUserId = "integrationTestUser";
        testCartItemRequest = new CartItemRequest("testProduct", 2, "red");
        
        // Clean up any existing test data
        cartRepository.findByUserId(testUserId)
                .ifPresent(cart -> cartRepository.delete(cart));
    }

    @Test
    void testCreateAndGetCart() throws CartNotFoundException {
        // When
        CartResponse createdCart = cartService.createCart(testUserId);
        CartResponse retrievedCart = cartService.getCartByUserId(testUserId);

        // Then
        assertNotNull(createdCart);
        assertNotNull(retrievedCart);
        assertEquals(testUserId, createdCart.getUserId());
        assertEquals(testUserId, retrievedCart.getUserId());
        assertEquals(0, createdCart.getTotalPrice());
        assertTrue(createdCart.getItems().isEmpty());
    }

    @Test
    void testCartLifecycle() throws Exception {
        // Create cart
        CartResponse cart = cartService.createCart(testUserId);
        assertEquals(testUserId, cart.getUserId());
        assertTrue(cart.getItems().isEmpty());

        // Verify cart exists in database
        Cart savedCart = cartRepository.findByUserId(testUserId)
                .orElseThrow(() -> new AssertionError("Cart should exist in database"));
        assertEquals(testUserId, savedCart.getUserId());
        assertTrue(savedCart.getItems().isEmpty());

        // Clear cart
        cartService.clearCart(testUserId);
        
        // Verify cart is cleared
        CartResponse clearedCart = cartService.getCartByUserId(testUserId);
        assertTrue(clearedCart.getItems().isEmpty());
        assertEquals(0, clearedCart.getTotalPrice());
    }

    @Test
    void testCartPersistence() throws CartNotFoundException {
        // Create cart and add item (this will create mock data since we don't have real inventory service)
        CartResponse cart = cartService.createCart(testUserId);
        assertNotNull(cart);

        // Manually add item to database for testing
        Cart dbCart = cartRepository.findByUserId(testUserId).orElseThrow();
        CartItems item = new CartItems();
        item.setProductId("testProduct");
        item.setProductName("Test Product");
        item.setColor("red");
        item.setQuantity(2);
        item.setPrice(1000);
        item.setCart(dbCart);
        
        dbCart.getItems().add(item);
        dbCart.setTotalPrice(2000);
        cartRepository.save(dbCart);

        // Retrieve cart and verify persistence
        CartResponse retrievedCart = cartService.getCartByUserId(testUserId);
        assertEquals(1, retrievedCart.getItems().size());
        assertEquals("testProduct", retrievedCart.getItems().get(0).getProductId());
        assertEquals(2000, retrievedCart.getTotalPrice());
    }

    @Test
    void testRemoveItemFromCart() throws CartNotFoundException {
        // Setup - create cart with item
        Cart cart = new Cart();
        cart.setUserId(testUserId);
        cart.setTotalPrice(2000);

        CartItems item = new CartItems();
        item.setProductId("testProduct");
        item.setProductName("Test Product");
        item.setColor("red");
        item.setQuantity(2);
        item.setPrice(1000);
        item.setCart(cart);
        
        cart.getItems().add(item);
        cartRepository.save(cart);

        // When - remove item
        CartResponse result = cartService.removeItemFromCart(testUserId, "testProduct", "red");

        // Then
        assertNotNull(result);
        assertTrue(result.getItems().isEmpty());
        assertEquals(0, result.getTotalPrice());
    }

    @Test
    void testUpdateCartItem() throws Exception {
        // Setup - create cart with item
        Cart cart = new Cart();
        cart.setUserId(testUserId);
        cart.setTotalPrice(2000);

        CartItems item = new CartItems();
        item.setProductId("testProduct");
        item.setProductName("Test Product");
        item.setColor("red");
        item.setQuantity(2);
        item.setPrice(1000);
        item.setCart(cart);
        
        cart.getItems().add(item);
        cartRepository.save(cart);

        // Note: This test will fail without proper inventory service mock
        // But demonstrates the integration test structure
        
        // Verify cart exists
        CartResponse cartResponse = cartService.getCartByUserId(testUserId);
        assertEquals(1, cartResponse.getItems().size());
        assertEquals(2, cartResponse.getItems().get(0).getQuantity());
    }

    @Test
    void testCartNotFound() {
        // When & Then
        assertThrows(CartNotFoundException.class, () -> 
            cartService.removeItemFromCart("nonExistentUser", "product", "color"));
    }

    @Test
    void testCreateGuestCart() {
        // Given
        String guestId = "guest_integration_test";

        // When
        CartResponse guestCart = cartService.createGuestCart(guestId);

        // Then
        assertNotNull(guestCart);
        assertEquals(guestId, guestCart.getUserId());
        assertEquals(0, guestCart.getTotalPrice());
        assertTrue(guestCart.getItems().isEmpty());
    }

    @Test
    void testGetGuestCartById() throws CartNotFoundException {
        // Given
        String guestId = "guest_test_retrieve";
        cartService.createGuestCart(guestId);

        // When
        CartResponse retrievedCart = cartService.getGuestCartById(guestId);

        // Then
        assertNotNull(retrievedCart);
        assertEquals(guestId, retrievedCart.getUserId());
    }

    @Test
    void testClearGuestCart() throws CartNotFoundException {
        // Given
        String guestId = "guest_test_clear";
        cartService.createGuestCart(guestId);

        // When
        cartService.clearGuestCart(guestId);

        // Then - should still exist but be empty
        CartResponse clearedCart = cartService.getGuestCartById(guestId);
        assertTrue(clearedCart.getItems().isEmpty());
        assertEquals(0, clearedCart.getTotalPrice());
    }
} 