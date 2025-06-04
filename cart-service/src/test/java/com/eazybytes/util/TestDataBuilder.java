package com.eazybytes.util;

import com.eazybytes.dto.CartItemRequest;
import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.CartResponse;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.model.Cart;
import com.eazybytes.model.CartItems;

import java.util.ArrayList;
import java.util.List;

public class TestDataBuilder {

    public static Cart createTestCart(String userId) {
        Cart cart = new Cart();
        cart.setUserId(userId);
        cart.setTotalPrice(0);
        cart.setItems(new ArrayList<>());
        return cart;
    }

    public static CartItems createTestCartItem(String productId, String productName, String color, Integer quantity, Integer price) {
        CartItems item = new CartItems();
        item.setProductId(productId);
        item.setProductName(productName);
        item.setColor(color);
        item.setQuantity(quantity);
        item.setPrice(price);
        return item;
    }

    public static CartItemRequest createTestCartItemRequest(String productId, Integer quantity, String color) {
        return new CartItemRequest(productId, quantity, color);
    }

    public static CartItemResponse createTestCartItemResponse(String productId, String productName, String color, Integer quantity, Integer price) {
        return new CartItemResponse(productId, productName, price, quantity, color, true);
    }

    public static CartResponse createTestCartResponse(String userId, Integer totalPrice, List<CartItemResponse> items) {
        return new CartResponse(userId, totalPrice, items);
    }

    public static InventoryDto createTestInventoryDto(String productId, String productName, String color, Integer quantity, Integer currentPrice) {
        InventoryDto inventory = new InventoryDto();
        inventory.setProductId(productId);
        inventory.setProductName(productName);
        inventory.setColor(color);
        inventory.setQuantity(quantity);
        inventory.setCurrentPrice(currentPrice);
        return inventory;
    }

    public static Cart createCartWithItems(String userId, List<CartItems> items) {
        Cart cart = createTestCart(userId);
        items.forEach(item -> {
            item.setCart(cart);
            cart.getItems().add(item);
        });
        cart.setTotalPrice(items.stream().mapToInt(item -> item.getPrice() * item.getQuantity()).sum());
        return cart;
    }

    public static List<CartItems> createTestCartItems() {
        List<CartItems> items = new ArrayList<>();
        
        CartItems item1 = createTestCartItem("product1", "Test Product 1", "red", 2, 1000);
        CartItems item2 = createTestCartItem("product2", "Test Product 2", "blue", 1, 2000);
        
        items.add(item1);
        items.add(item2);
        
        return items;
    }

    public static List<CartItemResponse> createTestCartItemResponses() {
        List<CartItemResponse> items = new ArrayList<>();
        
        CartItemResponse item1 = createTestCartItemResponse("product1", "Test Product 1", "red", 2, 1000);
        CartItemResponse item2 = createTestCartItemResponse("product2", "Test Product 2", "blue", 1, 2000);
        
        items.add(item1);
        items.add(item2);
        
        return items;
    }

    public static List<CartItemRequest> createTestCartItemRequests() {
        List<CartItemRequest> items = new ArrayList<>();
        
        CartItemRequest item1 = createTestCartItemRequest("product1", 2, "red");
        CartItemRequest item2 = createTestCartItemRequest("product2", 1, "blue");
        
        items.add(item1);
        items.add(item2);
        
        return items;
    }
} 