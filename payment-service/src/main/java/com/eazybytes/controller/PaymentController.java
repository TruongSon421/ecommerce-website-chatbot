package com.eazybytes.controller;

import com.eazybytes.model.Payment;
import com.eazybytes.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Endpoint để lấy thông tin chi tiết của một giao dịch thanh toán
     * dựa trên ID của đơn hàng liên quan.
     *
     * @param orderId ID của đơn hàng
     * @return ResponseEntity chứa thông tin Payment nếu tìm thấy, hoặc lỗi với thông điệp.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable Long orderId) {
        log.debug("Received request to get payment details for orderId: {}", orderId);
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);
            log.info("Found payment details for orderId: {}, status: {}", orderId, payment.getStatus());
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            log.error("Payment not found for orderId: {}", orderId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Payment not found for orderId: " + orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Unexpected error while fetching payment for orderId: {}", orderId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error while fetching payment");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}