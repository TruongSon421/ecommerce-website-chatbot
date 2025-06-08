package com.eazybytes.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eazybytes.model.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm tất cả đơn hàng theo userId
    List<Order> findByUserId(String userId);

    // Tìm đơn hàng theo userId và trạng thái (tùy chọn, nếu cần)
    List<Order> findByUserIdAndStatus(String userId, Order.OrderStatus status);

    Optional<Order> findByTransactionId(String transactionId);

    // Method to find order by ID with items fetched
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
    
    // Method to find order by transaction ID with items fetched
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.transactionId = :transactionId")
    Optional<Order> findByTransactionIdWithItems(@Param("transactionId") String transactionId);

    // New admin methods for pagination and filtering with FETCH JOIN
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items")
    Page<Order> findAllWithItems(Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.userId = :userId")
    Page<Order> findByUserIdWithItems(@Param("userId") String userId, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status")
    Page<Order> findByStatusWithItems(@Param("status") Order.OrderStatus status, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status AND o.userId = :userId")
    Page<Order> findByStatusAndUserIdWithItems(@Param("status") Order.OrderStatus status, @Param("userId") String userId, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.transactionId LIKE %:transactionId%")
    Page<Order> findByTransactionIdContainingWithItems(@Param("transactionId") String transactionId, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status AND o.transactionId LIKE %:transactionId%")
    Page<Order> findByStatusAndTransactionIdContainingWithItems(@Param("status") Order.OrderStatus status, @Param("transactionId") String transactionId, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.userId = :userId AND o.transactionId LIKE %:transactionId%")
    Page<Order> findByUserIdAndTransactionIdContainingWithItems(@Param("userId") String userId, @Param("transactionId") String transactionId, Pageable pageable);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.status = :status AND o.userId = :userId AND o.transactionId LIKE %:transactionId%")
    Page<Order> findByStatusAndUserIdAndTransactionIdContainingWithItems(@Param("status") Order.OrderStatus status, @Param("userId") String userId, @Param("transactionId") String transactionId, Pageable pageable);

    // Original methods without FETCH JOIN
    Page<Order> findByUserId(String userId, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    Page<Order> findByStatusAndUserId(Order.OrderStatus status, String userId, Pageable pageable);
    Page<Order> findByTransactionIdContaining(String transactionId, Pageable pageable);
    Page<Order> findByStatusAndTransactionIdContaining(Order.OrderStatus status, String transactionId, Pageable pageable);
    Page<Order> findByUserIdAndTransactionIdContaining(String userId, String transactionId, Pageable pageable);
    Page<Order> findByStatusAndUserIdAndTransactionIdContaining(Order.OrderStatus status, String userId, String transactionId, Pageable pageable);

    // Statistics methods
    long countByStatus(Order.OrderStatus status);
    long countByCreatedAtAfter(LocalDateTime date);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    Integer sumTotalAmountByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt >= :date")
    Integer sumTotalAmountByStatusAndCreatedAtAfter(@Param("status") Order.OrderStatus status, @Param("date") LocalDateTime date);

    // Method to find orders by userId and status with items fetched
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.userId = :userId AND o.status = :status")
    List<Order> findByUserIdAndStatusWithItems(@Param("userId") String userId, @Param("status") Order.OrderStatus status);

    // Method to find orders by userId and status with items fetched (pageable)
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.userId = :userId AND o.status = :status")
    Page<Order> findByUserIdAndStatusWithItems(@Param("userId") String userId, @Param("status") Order.OrderStatus status, Pageable pageable);
}