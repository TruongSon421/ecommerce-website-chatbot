package com.eazybytes.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartTest {

    private Cart cart;
    private CartItems cartItem1;
    private CartItems cartItem2;

    @BeforeEach
    void setUp() {
        cart = new Cart();
        cart.setUserId("user1");
        cart.setTotalPrice(0);

        cartItem1 = new CartItems();
        cartItem1.setProductId("product1");
        cartItem1.setQuantity(2);
        cartItem1.setColor("red");
        cartItem1.setPrice(1000);

        cartItem2 = new CartItems();
        cartItem2.setProductId("product2");
        cartItem2.setQuantity(1);
        cartItem2.setColor("blue");
        cartItem2.setPrice(2000);
    }

    @Test
    void testCartInitialization() {
        Cart newCart = new Cart();
        assertNotNull(newCart.getItems());
        assertTrue(newCart.getItems().isEmpty());
    }

    @Test
    void testSetAndGetUserId() {
        cart.setUserId("testUser");
        assertEquals("testUser", cart.getUserId());
    }

    @Test
    void testSetAndGetTotalPrice() {
        cart.setTotalPrice(5000);
        assertEquals(5000, cart.getTotalPrice());
    }

    @Test
    void testAddItem() {
        cart.addItem(cartItem1);
        
        assertEquals(1, cart.getItems().size());
        assertEquals(cartItem1, cart.getItems().get(0));
        assertEquals(cart, cartItem1.getCart());
    }

    @Test
    void testAddSameProductAndColorIncreasesQuantity() {
        cart.addItem(cartItem1);
        
        CartItems sameProductItem = new CartItems();
        sameProductItem.setProductId("product1");
        sameProductItem.setQuantity(3);
        sameProductItem.setColor("red");
        sameProductItem.setPrice(1000);
        
        cart.addItem(sameProductItem);
        
        assertEquals(1, cart.getItems().size());
        assertEquals(5, cart.getItems().get(0).getQuantity()); // 2 + 3 = 5
    }

    @Test
    void testAddDifferentProducts() {
        cart.addItem(cartItem1);
        cart.addItem(cartItem2);
        
        assertEquals(2, cart.getItems().size());
        assertTrue(cart.getItems().contains(cartItem1));
        assertTrue(cart.getItems().contains(cartItem2));
    }

    @Test
    void testAddSameProductDifferentColor() {
        cart.addItem(cartItem1);
        
        CartItems sameProductDifferentColor = new CartItems();
        sameProductDifferentColor.setProductId("product1");
        sameProductDifferentColor.setQuantity(3);
        sameProductDifferentColor.setColor("blue"); // Different color
        sameProductDifferentColor.setPrice(1000);
        
        cart.addItem(sameProductDifferentColor);
        
        assertEquals(2, cart.getItems().size()); // Should be 2 separate items
        assertEquals(2, cart.getItems().get(0).getQuantity()); // Original quantity unchanged
        assertEquals(3, cart.getItems().get(1).getQuantity()); // New item quantity
    }

    @Test
    void testRemoveItem() {
        cart.addItem(cartItem1);
        cart.addItem(cartItem2);
        
        cart.removeItem("product1", "red");
        
        assertEquals(1, cart.getItems().size());
        assertFalse(cart.getItems().contains(cartItem1));
        assertTrue(cart.getItems().contains(cartItem2));
    }

    @Test
    void testRemoveNonExistentItem() {
        cart.addItem(cartItem1);
        
        cart.removeItem("nonexistent");
        
        assertEquals(1, cart.getItems().size());
        assertTrue(cart.getItems().contains(cartItem1));
    }

    @Test
    void testClearItems() {
        cart.addItem(cartItem1);
        cart.addItem(cartItem2);
        
        cart.clearItems();
        
        assertTrue(cart.getItems().isEmpty());
    }

    @Test
    void testVersionField() {
        assertNull(cart.getVersion());
        
        cart.setVersion(1L);
        assertEquals(1L, cart.getVersion());
    }

    @Test
    void testTransactionIdField() {
        assertNull(cart.getTransactionId());
        
        cart.setTransactionId("txn123");
        assertEquals("txn123", cart.getTransactionId());
    }
} 