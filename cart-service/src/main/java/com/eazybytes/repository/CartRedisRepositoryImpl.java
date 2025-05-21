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
            String redisKey = GUEST_CART_KEY_PREFIX + guestId;
            String json = redisTemplate.opsForValue().get(redisKey);
            
            log.info("Retrieving guest cart from Redis with key: {}", redisKey);
            
            if (json != null) {
                log.info("Found JSON in Redis for guest cart: {}, length: {}", guestId, json.length());
                
                // Debug JSON để xem cấu trúc
                if (log.isDebugEnabled()) {
                    log.debug("JSON from Redis: {}", json);
                }
                
                Cart cart = objectMapper.readValue(json, Cart.class);
                
                if (cart != null && cart.getItems() != null) {
                    log.info("Deserialized cart for guest {}: contains {} items", guestId, cart.getItems().size());
                } else {
                    log.warn("Deserialized cart for guest {} but items list is null or cart is null", guestId);
                }
                
                return cart;
            } else {
                log.warn("No JSON found in Redis for guest cart: {}", guestId);
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to deserialize cart from Redis for guest: {}", guestId, e);
            return null;
        }
    }

    @Override
    public void saveGuestCart(String guestId, Cart cart) {
        try {
            String redisKey = GUEST_CART_KEY_PREFIX + guestId;
            
            // In ra thông tin debug để phân tích
            if (cart.getItems() != null) {
                log.info("Saving cart with {} items for guest: {}", cart.getItems().size(), guestId);
                if (log.isDebugEnabled()) {
                    cart.getItems().forEach(item -> log.debug("Item: productId={}, color={}, quantity={}", 
                            item.getProductId(), item.getColor(), item.getQuantity()));
                }
            } else {
                log.warn("Saving cart with null items list for guest: {}", guestId);
            }
            
            String json = objectMapper.writeValueAsString(cart);
            log.info("Serialized JSON length: {}", json.length());
            
            // Debug JSON để xem cấu trúc
            if (log.isDebugEnabled()) {
                log.debug("Serialized JSON: {}", json);
            }
            
            redisTemplate.opsForValue().set(redisKey, json);
            // Đặt thời gian sống cho giỏ hàng khách vãng lai
            redisTemplate.expire(redisKey, GUEST_CART_TTL, java.util.concurrent.TimeUnit.SECONDS);
            
            log.info("Saved cart to Redis for guest: {} with TTL {} days", guestId, GUEST_CART_TTL / (24 * 60 * 60));
            
            // Kiểm tra lại dữ liệu đã lưu
            String savedJson = redisTemplate.opsForValue().get(redisKey);
            if (savedJson != null) {
                log.info("Verified guest cart saved successfully: JSON length {} bytes", savedJson.length());
            } else {
                log.warn("Failed to verify guest cart: JSON not found after saving");
            }
        } catch (Exception e) {
            log.error("Failed to serialize cart to Redis for guest: {}", guestId, e);
        }
    }

    @Override
    public void deleteGuestCart(String guestId) {
        String redisKey = GUEST_CART_KEY_PREFIX + guestId;
        redisTemplate.delete(redisKey);
        log.debug("Deleted cart from Redis for guest: {}", guestId);
    }
    
    @Override
    public boolean existsByGuestId(String guestId) {
        String redisKey = GUEST_CART_KEY_PREFIX + guestId;
        Boolean exists = redisTemplate.hasKey(redisKey);
        return Boolean.TRUE.equals(exists);
    }
}