package com.eazybytes.cart.repository;

import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.eazybytes.cart.model.Cart;

@Repository
public class CartRedisRepository {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CART_KEY_PREFIX = "cart:";

    public CartRedisRepository(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void save(String userId, Cart cart) {
        redisTemplate.opsForValue().set(CART_KEY_PREFIX + userId, cart, 3600, TimeUnit.SECONDS);
    }

    public Cart findByUserId(String userId) {
        return (Cart) redisTemplate.opsForValue().get(CART_KEY_PREFIX + userId);
    }

    public void delete(String userId) {
        redisTemplate.delete(CART_KEY_PREFIX + userId);
    }
}