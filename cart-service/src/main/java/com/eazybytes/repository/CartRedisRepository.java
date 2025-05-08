package com.eazybytes.repository;

import com.eazybytes.model.Cart;

public interface CartRedisRepository {
    Cart findByUserId(String userId);
    void save(String userId, Cart cart);
    void delete(String userId);
}