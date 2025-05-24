package com.eazybytes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eazybytes.model.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm tất cả đơn hàng theo userId
    List<Order> findByUserId(String userId);

    // Tìm đơn hàng theo userId và trạng thái (tùy chọn, nếu cần)
    List<Order> findByUserIdAndStatus(String userId, Order.OrderStatus status);

    Optional<Order> findByTransactionId(String transactionId);
}