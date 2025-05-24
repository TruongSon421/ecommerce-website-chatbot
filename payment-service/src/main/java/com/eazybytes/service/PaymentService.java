package com.eazybytes.service;

import com.eazybytes.dto.ConfirmVNPayPaymentResponseDto;
import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.model.Payment;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

public interface PaymentService {
    void processPayment(ProcessPaymentRequest request);
    Payment getPaymentByOrderId(Long orderId);
    ConfirmVNPayPaymentResponseDto handleVNPayReturnUrl(HttpServletRequest request);
    void handleVNPayCallback(Map<String, String> vnpayParams);
    Optional<Payment> findPaymentByTransactionId(String transactionId);
}