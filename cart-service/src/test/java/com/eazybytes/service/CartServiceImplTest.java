package com.eazybytes.service;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.*;
import com.eazybytes.event.CartEventProducer;
import com.eazybytes.exception.CartNotFoundException;
import com.eazybytes.exception.InvalidItemException;
import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import com.eazybytes.repository.CartRedisRepository;
import com.eazybytes.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.dao.OptimisticLockingFailureException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartRedisRepository cartRedisRepository;

    @Mock
    private CartEventProducer cartEventProducer;

    @Mock
    private InventoryClient inventoryClient;

    @Mock
    private CircuitBreakerFactory<?, ?> cbFactory;

    @Mock
    private CircuitBreaker circuitBreaker;

    @InjectMocks
    private CartServiceImpl cartService;

    private Cart testCart;
    private CartItems testCartItem;
    private InventoryDto testInventory;

    @BeforeEach
    void setUp() {
        testCart = new Cart();
        testCart.setId(1L);
        testCart.setUserId("testUser");
        testCart.setTotalPrice(0);
        testCart.setItems(new ArrayList<>());

        testCartItem = new CartItems();
        testCartItem.setId(1L);
        testCartItem.setProductId("product1");
        testCartItem.setProductName("Test Product");
        testCartItem.setColor("red");
        testCartItem.setQuantity(2);
        testCartItem.setPrice(1000);
        testCartItem.setCart(testCart);

        testInventory = new InventoryDto();
        testInventory.setProductId("product1");
        testInventory.setProductName("Test Product");
        testInventory.setColor("red");
        testInventory.setQuantity(10);
        testInventory.setCurrentPrice(1000);

        when(cbFactory.create(anyString())).thenReturn(circuitBreaker);
    }

    @Test
    void testGetCartByUserId_WhenCartExistsInCache() throws CartNotFoundException {
        // Given
        testCart.getItems().add(testCartItem);
        when(cartRedisRepository.findByUserId("testUser")).thenReturn(testCart);

        // When
        CartResponse result = cartService.getCartByUserId("testUser");

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserId());
        assertEquals(1, result.getItems().size());
        verify(cartRepository, never()).findByUserId(anyString());
    }

    @Test
    void testGetCartByUserId_WhenCartNotInCache() throws CartNotFoundException {
        // Given
        testCart.getItems().add(testCartItem);
        when(cartRedisRepository.findByUserId("testUser")).thenReturn(null);
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));

        // When
        CartResponse result = cartService.getCartByUserId("testUser");

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserId());
        assertEquals(1, result.getItems().size());
        verify(cartRedisRepository).save("testUser", testCart);
    }

    @Test
    void testGetCartByUserId_WhenCartNotExists() throws CartNotFoundException {
        // Given
        when(cartRedisRepository.findByUserId("testUser")).thenReturn(null);
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.getCartByUserId("testUser");

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserId());
        assertEquals(0, result.getItems().size());
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void testAddItemToCart_NewItem() throws CartNotFoundException, InvalidItemException {
        // Given
        CartItemRequest request = new CartItemRequest("product1", 2, "red");
        
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class))).thenReturn(testInventory);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.addItemToCart("testUser", request);

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserId());
        verify(cartRepository).save(any(Cart.class));
        verify(cartRedisRepository).save("testUser", testCart);
    }

    @Test
    void testAddItemToCart_ExistingItem() throws CartNotFoundException, InvalidItemException {
        // Given
        testCart.getItems().add(testCartItem);
        CartItemRequest request = new CartItemRequest("product1", 2, "red");
        
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class))).thenReturn(testInventory);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.addItemToCart("testUser", request);

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserId());
        assertEquals(1, testCart.getItems().size());
        assertEquals(4, testCart.getItems().get(0).getQuantity()); // 2 + 2 = 4
    }

    @Test
    void testAddItemToCart_InsufficientInventory() {
        // Given
        CartItemRequest request = new CartItemRequest("product1", 15, "red");
        
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class))).thenReturn(testInventory);

        // When & Then
        assertThrows(InvalidItemException.class, () -> 
            cartService.addItemToCart("testUser", request));
    }

    @Test
    void testAddItemToCart_OptimisticLockingFailure() throws CartNotFoundException, InvalidItemException {
        // Given
        CartItemRequest request = new CartItemRequest("product1", 2, "red");
        
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class))).thenReturn(testInventory);
        when(cartRepository.save(any(Cart.class)))
            .thenThrow(new OptimisticLockingFailureException("Optimistic lock failed"))
            .thenReturn(testCart);

        // When
        CartResponse result = cartService.addItemToCart("testUser", request);

        // Then
        assertNotNull(result);
        verify(cartRepository, times(2)).save(any(Cart.class));
    }

    @Test
    void testUpdateCartItem_ValidUpdate() throws CartNotFoundException, InvalidItemException {
        // Given
        testCart.getItems().add(testCartItem);
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class))).thenReturn(testInventory);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.updateCartItem("testUser", "product1", 5, "red");

        // Then
        assertNotNull(result);
        assertEquals(5, testCartItem.getQuantity());
        verify(cartRepository).save(testCart);
    }

    @Test
    void testUpdateCartItem_RemoveWhenQuantityZero() throws CartNotFoundException, InvalidItemException {
        // Given
        testCart.getItems().add(testCartItem);
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class))).thenReturn(testInventory);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.updateCartItem("testUser", "product1", 0, "red");

        // Then
        assertNotNull(result);
        assertTrue(testCart.getItems().isEmpty());
        verify(cartRepository).save(testCart);
    }

    @Test
    void testRemoveItemFromCart() throws CartNotFoundException {
        // Given
        testCart.getItems().add(testCartItem);
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.removeItemFromCart("testUser", "product1", "red");

        // Then
        assertNotNull(result);
        assertTrue(testCart.getItems().isEmpty());
        verify(cartRepository).save(testCart);
        verify(cartRedisRepository).save("testUser", testCart);
    }

    @Test
    void testClearCart() throws CartNotFoundException {
        // Given
        testCart.getItems().add(testCartItem);
        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));

        // When
        cartService.clearCart("testUser");

        // Then
        assertTrue(testCart.getItems().isEmpty());
        assertEquals(0, testCart.getTotalPrice());
        verify(cartRepository).save(testCart);
        verify(cartRedisRepository).delete("testUser");
    }

    @Test
    void testCreateCart() {
        // Given
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.createCart("testUser");

        // Then
        assertNotNull(result);
        assertEquals("testUser", result.getUserId());
        assertEquals(0, result.getTotalPrice());
        assertTrue(result.getItems().isEmpty());
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void testMergeListItemToCart() throws CartNotFoundException, InvalidItemException {
        // Given
        List<CartItemRequest> guestItems = List.of(
            new CartItemRequest("product1", 2, "red"),
            new CartItemRequest("product2", 1, "blue")
        );
        
        InventoryDto inventory2 = new InventoryDto();
        inventory2.setProductId("product2");
        inventory2.setProductName("Test Product 2");
        inventory2.setColor("blue");
        inventory2.setQuantity(5);
        inventory2.setCurrentPrice(2000);

        when(cartRepository.findByUserId("testUser")).thenReturn(Optional.of(testCart));
        when(circuitBreaker.run(any(Supplier.class)))
            .thenReturn(testInventory)
            .thenReturn(inventory2);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When
        CartResponse result = cartService.mergeListItemToCart("testUser", guestItems);

        // Then
        assertNotNull(result);
        assertEquals(2, testCart.getItems().size());
        verify(cartRepository).save(testCart);
    }

    @Test
    void testGetCartByUserId_CartNotFound() {
        // Given
        when(cartRedisRepository.findByUserId("nonExistentUser")).thenReturn(null);
        when(cartRepository.findByUserId("nonExistentUser")).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // When & Then
        assertDoesNotThrow(() -> cartService.getCartByUserId("nonExistentUser"));
    }

    @Test
    void testCreateGuestCart() {
        // Given
        String guestId = "guest123";
        Cart guestCart = new Cart();
        guestCart.setUserId(guestId);
        doNothing().when(cartRedisRepository).save(eq(guestId), any(Cart.class));

        // When
        CartResponse result = cartService.createGuestCart(guestId);

        // Then
        assertNotNull(result);
        assertEquals(guestId, result.getUserId());
        assertEquals(0, result.getTotalPrice());
        assertTrue(result.getItems().isEmpty());
        verify(cartRedisRepository).save(eq(guestId), any(Cart.class));
    }

    @Test
    void testGetGuestCartById_CartExists() throws CartNotFoundException {
        // Given
        String guestId = "guest123";
        testCart.setUserId(guestId);
        testCart.getItems().add(testCartItem);
        when(cartRedisRepository.findByUserId(guestId)).thenReturn(testCart);

        // When
        CartResponse result = cartService.getGuestCartById(guestId);

        // Then
        assertNotNull(result);
        assertEquals(guestId, result.getUserId());
        assertEquals(1, result.getItems().size());
    }

    @Test
    void testGetGuestCartById_CartNotFound() {
        // Given
        String guestId = "nonExistentGuest";
        when(cartRedisRepository.findByUserId(guestId)).thenReturn(null);

        // When & Then
        assertThrows(CartNotFoundException.class, () -> 
            cartService.getGuestCartById(guestId));
    }
} 