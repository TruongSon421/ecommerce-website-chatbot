package com.eazybytes.payment.controller;

// Import các lớp cần thiết
import com.eazybytes.payment.model.Payment;
import com.eazybytes.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

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
     * @param orderId ID của đơn hàng (UUID)
     * @return ResponseEntity chứa thông tin Payment nếu tìm thấy, hoặc 404 Not Found.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(@PathVariable String orderId) { // Nhận String từ path
        UUID orderUuid;
        try {
            orderUuid = UUID.fromString(orderId); // Parse String sang UUID
        } catch (IllegalArgumentException e) {
            log.error("Invalid Order ID format received in path: {}", orderId);
            // Có thể trả về 400 Bad Request thay vì 404
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        try {
            log.debug("Received request to get payment details for order ID: {}", orderUuid);
            Payment payment = paymentService.getPaymentByOrderId(orderUuid);
            log.debug("Found payment details: {}", payment);
            return ResponseEntity.ok(payment); // Trả về 200 OK và thông tin payment
        } catch (RuntimeException e) { // Bắt lỗi cụ thể hơn nếu cần (ví dụ: PaymentNotFoundException)
            log.error("Payment not found for order ID: {}", orderUuid, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            log.error("An unexpected error occurred while fetching payment for order ID: {}", orderUuid, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}