package com.eazybytes.repository;

import com.eazybytes.model.Cart;

public interface CartRedisRepository {
    // Phương thức cho người dùng đã đăng nhập
    Cart findByUserId(String userId);
    void save(String userId, Cart cart);
    void delete(String userId);
    
    // Phương thức cho khách vãng lai
    Cart findByGuestId(String guestId);
    void saveGuestCart(String guestId, Cart cart);
    void deleteGuestCart(String guestId);
    
    // Kiểm tra sự tồn tại của giỏ hàng
    boolean existsByGuestId(String guestId);
}