package com.eazybytes.payment.repository;

import com.eazybytes.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(UUID orderId);

    Optional<Payment> findByPaymentId(String paymentId);

    // Thêm phương thức tìm theo transactionId để kiểm tra idempotency
    Optional<Payment> findByTransactionId(String transactionId);
}