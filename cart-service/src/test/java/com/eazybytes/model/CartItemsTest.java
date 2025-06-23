package com.eazybytes.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CartItemsTest {

    private CartItems cartItem;
    private Cart cart;

    @BeforeEach
    void setUp() {
        cart = new Cart();
        cart.setUserId("user1");
        
        cartItem = new CartItems();
        cartItem.setProductId("product1");
        cartItem.setProductName("Test Product");
        cartItem.setColor("red");
        cartItem.setQuantity(2);
        cartItem.setPrice(1000);
        cartItem.setCart(cart);
    }

    @Test
    void testCartItemCreation() {
        assertNotNull(cartItem);
        assertEquals("product1", cartItem.getProductId());
        assertEquals("Test Product", cartItem.getProductName());
        assertEquals("red", cartItem.getColor());
        assertEquals(2, cartItem.getQuantity());
        assertEquals(1000, cartItem.getPrice());
        assertEquals(cart, cartItem.getCart());
    }

    @Test
    void testConstructorWithAllArgs() {
        CartItems item = new CartItems(1L, "prod2", "Product 2", "blue", 3, 2000, cart);
        
        assertEquals(1L, item.getId());
        assertEquals("prod2", item.getProductId());
        assertEquals("Product 2", item.getProductName());
        assertEquals("blue", item.getColor());
        assertEquals(3, item.getQuantity());
        assertEquals(2000, item.getPrice());
        assertEquals(cart, item.getCart());
    }

    @Test
    void testNoArgsConstructor() {
        CartItems emptyItem = new CartItems();
        
        assertNull(emptyItem.getId());
        assertNull(emptyItem.getProductId());
        assertNull(emptyItem.getProductName());
        assertNull(emptyItem.getColor());
        assertNull(emptyItem.getQuantity());
        assertNull(emptyItem.getPrice());
        assertNull(emptyItem.getCart());
    }

    @Test
    void testSetAndGetId() {
        cartItem.setId(123L);
        assertEquals(123L, cartItem.getId());
    }

    @Test
    void testSetAndGetProductId() {
        cartItem.setProductId("newProduct");
        assertEquals("newProduct", cartItem.getProductId());
    }

    @Test
    void testSetAndGetProductName() {
        cartItem.setProductName("New Product Name");
        assertEquals("New Product Name", cartItem.getProductName());
    }

    @Test
    void testSetAndGetColor() {
        cartItem.setColor("green");
        assertEquals("green", cartItem.getColor());
    }

    @Test
    void testSetAndGetQuantity() {
        cartItem.setQuantity(5);
        assertEquals(5, cartItem.getQuantity());
    }

    @Test
    void testSetAndGetPrice() {
        cartItem.setPrice(3000);
        assertEquals(3000, cartItem.getPrice());
    }

    @Test
    void testSetAndGetCart() {
        Cart newCart = new Cart();
        newCart.setUserId("user2");
        
        cartItem.setCart(newCart);
        assertEquals(newCart, cartItem.getCart());
    }

    @Test
    void testEqualsAndHashCode() {
        CartItems item1 = new CartItems(1L, "prod1", "Product 1", "red", 2, 1000, cart);
        CartItems item2 = new CartItems(1L, "prod1", "Product 1", "red", 2, 1000, cart);
        CartItems item3 = new CartItems(2L, "prod2", "Product 2", "blue", 3, 2000, cart);

        assertEquals(item1, item2);
        assertNotEquals(item1, item3);
        assertEquals(item1.hashCode(), item2.hashCode());
    }

    @Test
    void testToString() {
        String toString = cartItem.toString();
        
        assertNotNull(toString);
        assertTrue(toString.contains("product1"));
        assertTrue(toString.contains("Test Product"));
        assertTrue(toString.contains("red"));
        assertTrue(toString.contains("2"));
        assertTrue(toString.contains("1000"));
    }
} 