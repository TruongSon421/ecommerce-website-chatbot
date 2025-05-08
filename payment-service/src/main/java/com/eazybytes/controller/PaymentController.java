package com.eazybytes.controller;

import com.eazybytes.model.Payment;
import com.eazybytes.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments") // Base path cho các API liên quan đến payment
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Endpoint để lấy thông tin chi tiết của một giao dịch thanh toán
     * dựa trên ID của đơn hàng liên quan.
     *
     * @param orderId ID của đơn hàng 
     * @return ResponseEntity chứa thông tin Payment nếu tìm thấy, hoặc 404 Not Found.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) { 
        Long orderIdLong;
        try {
            orderIdLong = Long.parseLong(orderId);
        } catch (NumberFormatException e) {
            log.error("Invalid Order ID format received in path: {}", orderId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        try {
            log.debug("Received request to get payment details for order ID: {}", orderIdLong);
            Payment payment = paymentService.getPaymentByOrderId(orderIdLong);
            log.debug("Found payment details: {}", payment);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            log.error("Payment not found for order ID: {}", orderIdLong, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching payment for order ID: {}", orderIdLong, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}