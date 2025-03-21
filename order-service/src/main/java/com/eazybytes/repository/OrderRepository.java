package com.eazybytes.repository;

import com.eazybytes.model.Order;
import com.eazybytes.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserId(String userId);

    Page<Order> findByUserId(String userId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}