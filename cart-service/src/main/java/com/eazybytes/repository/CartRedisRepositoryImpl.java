package com.eazybytes.repository;


import com.eazybytes.model.Cart;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
@Slf4j
public class CartRedisRepositoryImpl implements CartRedisRepository {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CART_KEY_PREFIX = "cart:";
    private static final String GUEST_CART_KEY_PREFIX = "guest-cart:";
    private static final long GUEST_CART_TTL = 7 * 24 * 60 * 60; // 7 ngày (tính bằng giây)

    @Override
    public Cart findByUserId(String userId) {
        try {
            String json = redisTemplate.opsForValue().get(CART_KEY_PREFIX + userId);
            if (json != null) {
                return objectMapper.readValue(json, Cart.class);
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to deserialize cart from Redis for user: {}", userId, e);
            return null;
        }
    }

    @Override
    public void save(String userId, Cart cart) {
        try {
            String json = objectMapper.writeValueAsString(cart);
            redisTemplate.opsForValue().set(CART_KEY_PREFIX + userId, json);
            log.debug("Saved cart to Redis for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to serialize cart to Redis for user: {}", userId, e);
        }
    }

    @Override
    public void delete(String userId) {
        redisTemplate.delete(CART_KEY_PREFIX + userId);
        log.debug("Deleted cart from Redis for user: {}", userId);
    }
    
    @Override
    public Cart findByGuestId(String guestId) {
        try {
            String json = redisTemplate.opsForValue().get(GUEST_CART_KEY_PREFIX + guestId);
            if (json != null) {
                return objectMapper.readValue(json, Cart.class);
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to deserialize cart from Redis for guest: {}", guestId, e);
            return null;
        }
    }

    @Override
    public void saveGuestCart(String guestId, Cart cart) {
        try {
            String json = objectMapper.writeValueAsString(cart);
            redisTemplate.opsForValue().set(GUEST_CART_KEY_PREFIX + guestId, json);
            // Đặt thời gian sống cho giỏ hàng khách vãng lai
            redisTemplate.expire(GUEST_CART_KEY_PREFIX + guestId, GUEST_CART_TTL, java.util.concurrent.TimeUnit.SECONDS);
            log.debug("Saved cart to Redis for guest: {} with TTL {} days", guestId, GUEST_CART_TTL / (24 * 60 * 60));
        } catch (Exception e) {
            log.error("Failed to serialize cart to Redis for guest: {}", guestId, e);
        }
    }

    @Override
    public void deleteGuestCart(String guestId) {
        redisTemplate.delete(GUEST_CART_KEY_PREFIX + guestId);
        log.debug("Deleted cart from Redis for guest: {}", guestId);
    }
    
    @Override
    public boolean existsByGuestId(String guestId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(GUEST_CART_KEY_PREFIX + guestId));
    }
}
