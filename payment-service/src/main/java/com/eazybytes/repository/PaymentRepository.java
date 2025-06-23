package com.eazybytes.repository;

import com.eazybytes.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByUserId(String userId);
    Optional<Payment> findByOrderIdAndUserId(Long orderId, String userId);
}