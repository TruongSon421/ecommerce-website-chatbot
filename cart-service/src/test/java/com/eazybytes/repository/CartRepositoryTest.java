package com.eazybytes.repository;

import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class CartRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CartRepository cartRepository;

    private Cart cart;
    private CartItems cartItem1;
    private CartItems cartItem2;

    @BeforeEach
    void setUp() {
        cart = new Cart();
        cart.setUserId("testUser");
        cart.setTotalPrice(3000);

        cartItem1 = new CartItems();
        cartItem1.setProductId("product1");
        cartItem1.setProductName("Product 1");
        cartItem1.setColor("red");
        cartItem1.setQuantity(2);
        cartItem1.setPrice(1000);
        cartItem1.setCart(cart);

        cartItem2 = new CartItems();
        cartItem2.setProductId("product2");
        cartItem2.setProductName("Product 2");
        cartItem2.setColor("blue");
        cartItem2.setQuantity(1);
        cartItem2.setPrice(2000);
        cartItem2.setCart(cart);

        cart.getItems().add(cartItem1);
        cart.getItems().add(cartItem2);
    }

    @Test
    void testSaveAndFindById() {
        // Given
        Cart savedCart = entityManager.persistAndFlush(cart);
        entityManager.clear();

        // When
        Optional<Cart> foundCart = cartRepository.findById(savedCart.getId());

        // Then
        assertTrue(foundCart.isPresent());
        assertEquals(savedCart.getId(), foundCart.get().getId());
        assertEquals("testUser", foundCart.get().getUserId());
        assertEquals(3000, foundCart.get().getTotalPrice());
    }

    @Test
    void testFindByUserId() {
        // Given
        entityManager.persistAndFlush(cart);
        entityManager.clear();

        // When
        Optional<Cart> foundCart = cartRepository.findByUserId("testUser");

        // Then
        assertTrue(foundCart.isPresent());
        assertEquals("testUser", foundCart.get().getUserId());
        assertEquals(2, foundCart.get().getItems().size());
        
        // Verify items are loaded
        assertNotNull(foundCart.get().getItems());
        assertEquals("product1", foundCart.get().getItems().get(0).getProductId());
        assertEquals("product2", foundCart.get().getItems().get(1).getProductId());
    }

    @Test
    void testFindByUserIdNotFound() {
        // Given
        entityManager.persistAndFlush(cart);
        entityManager.clear();

        // When
        Optional<Cart> foundCart = cartRepository.findByUserId("nonExistentUser");

        // Then
        assertFalse(foundCart.isPresent());
    }

    @Test
    void testDeleteCart() {
        // Given
        Cart savedCart = entityManager.persistAndFlush(cart);
        entityManager.clear();

        // When
        cartRepository.deleteById(savedCart.getId());
        entityManager.flush();

        // Then
        Optional<Cart> deletedCart = cartRepository.findById(savedCart.getId());
        assertFalse(deletedCart.isPresent());
    }

    @Test
    void testFindAll() {
        // Given
        Cart cart2 = new Cart();
        cart2.setUserId("user2");
        cart2.setTotalPrice(1500);

        entityManager.persistAndFlush(cart);
        entityManager.persistAndFlush(cart2);
        entityManager.clear();

        // When
        var allCarts = cartRepository.findAll();

        // Then
        assertEquals(2, allCarts.size());
    }

    @Test
    void testUpdateCart() {
        // Given
        Cart savedCart = entityManager.persistAndFlush(cart);
        entityManager.clear();

        // When
        savedCart.setTotalPrice(5000);
        Cart updatedCart = cartRepository.save(savedCart);

        // Then
        assertEquals(5000, updatedCart.getTotalPrice());
        
        // Verify in database
        Optional<Cart> foundCart = cartRepository.findById(savedCart.getId());
        assertTrue(foundCart.isPresent());
        assertEquals(5000, foundCart.get().getTotalPrice());
    }

    @Test
    void testCascadeDeleteItems() {
        // Given
        Cart savedCart = entityManager.persistAndFlush(cart);
        Long cartId = savedCart.getId();
        entityManager.clear();

        // When
        cartRepository.deleteById(cartId);
        entityManager.flush();

        // Then
        Optional<Cart> deletedCart = cartRepository.findById(cartId);
        assertFalse(deletedCart.isPresent());
        
        // Items should also be deleted due to cascade
        var allItems = entityManager.getEntityManager()
            .createQuery("SELECT ci FROM CartItems ci WHERE ci.cart.id = :cartId", CartItems.class)
            .setParameter("cartId", cartId)
            .getResultList();
        assertTrue(allItems.isEmpty());
    }
} 