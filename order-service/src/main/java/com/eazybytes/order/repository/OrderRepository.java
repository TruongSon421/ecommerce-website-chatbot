package com.eazybytes.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eazybytes.order.model.Order;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Tìm tất cả đơn hàng theo userId
    List<Order> findByUserId(String userId);

    // Tìm đơn hàng theo userId và trạng thái (tùy chọn, nếu cần)
    List<Order> findByUserIdAndStatus(String userId, Order.OrderStatus status);
}