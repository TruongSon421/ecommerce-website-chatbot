package com.eazybytes.controller;

import com.eazybytes.dto.InitiateVNPayPaymentResponseDto;
import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.model.Payment;
import com.eazybytes.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

    
    /**
     * Endpoint để xử lý payment và trả về payment URL
     * Frontend gọi API này khi user chọn phương thức thanh toán
     *
     * @param orderId ID của đơn hàng
     * @param userId ID của người dùng
     * @param paymentMethod Phương thức thanh toán
     * @param totalAmount Tổng số tiền
     * @param request HttpServletRequest để lấy IP của client
     * @return ResponseEntity chứa payment URL hoặc lỗi
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(
            @RequestParam Long orderId,
            @RequestParam String userId,
            @RequestParam String paymentMethod,
            @RequestParam Integer totalAmount,
            HttpServletRequest request) {
        
        log.info("Request to process payment for orderId: {}, userId: {}, paymentMethod: {}, amount: {}", 
                orderId, userId, paymentMethod, totalAmount);
        
        try {
            // Extract client IP address
            String clientIpAddress = getClientIpAddress(request);
            log.debug("Client IP address: {}", clientIpAddress);
            
            // Generate transaction ID
            String transactionId = java.util.UUID.randomUUID().toString();
            
            // Convert paymentMethod string to enum
            Payment.PaymentMethod paymentMethodEnum;
            try {
                paymentMethodEnum = Payment.PaymentMethod.valueOf(paymentMethod.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.error("Invalid payment method: {}", paymentMethod);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid payment method: " + paymentMethod);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Create ProcessPaymentRequest
            ProcessPaymentRequest processRequest = ProcessPaymentRequest.builder()
                    .transactionId(transactionId)
                    .userId(userId)
                    .orderId(orderId)
                    .totalAmount(totalAmount)
                    .paymentMethod(paymentMethodEnum)
                    .clientIpAddress(clientIpAddress)
                    .build();
            
            InitiateVNPayPaymentResponseDto response = paymentService.processPayment(processRequest);
            
            if (response != null) {
                log.info("Successfully processed payment and generated URL for orderId: {}, userId: {}", orderId, userId);
                return ResponseEntity.ok(response);
            } else {
                // Non-VNPay payment method - return success but no URL
                Map<String, String> successResponse = new HashMap<>();
                successResponse.put("message", "Payment processed successfully. No URL required for this payment method.");
                successResponse.put("transactionId", transactionId);
                return ResponseEntity.ok(successResponse);
            }
            
        } catch (RuntimeException e) {
            log.error("Error processing payment for orderId: {}, userId: {}. Error: {}", 
                    orderId, userId, e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Unexpected error processing payment for orderId: {}, userId: {}", 
                    orderId, userId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error while processing payment");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Endpoint để lấy payment URL bằng transaction ID
     * Frontend gọi API này sau khi checkout để lấy URL thanh toán
     *
     * @param transactionId Transaction ID từ checkout response
     * @param request HttpServletRequest để lấy IP của client
     * @return ResponseEntity chứa payment URL hoặc lỗi
     */
    @PostMapping("/url/{transactionId}")
    public ResponseEntity<?> getPaymentUrlByTransactionId(
            @PathVariable String transactionId,
            HttpServletRequest request) {
        
        log.info("Request to get payment URL for transactionId: {}", transactionId);
        
        try {
            // Extract client IP address
            String clientIpAddress = getClientIpAddress(request);
            log.debug("Client IP address: {}", clientIpAddress);
            
            // Find payment by transaction ID
            Optional<Payment> paymentOptional = paymentService.findPaymentByTransactionId(transactionId);
            if (paymentOptional.isEmpty()) {
                log.error("Payment not found for transactionId: {}", transactionId);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Payment not found for transaction ID: " + transactionId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            Payment payment = paymentOptional.get();
            
            // Check payment status
            if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Payment has already been completed successfully");
                response.put("status", "SUCCESS");
                return ResponseEntity.ok(response);
            }
            
            if (payment.getStatus() == Payment.PaymentStatus.PROCESSING) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Payment is currently being processed");
                response.put("status", "PROCESSING");
                return ResponseEntity.ok(response);
            }
            
            // Generate payment URL for PENDING or FAILED payments
            if (payment.getStatus() == Payment.PaymentStatus.PENDING || payment.getStatus() == Payment.PaymentStatus.FAILED) {
                // Check if payment method supports VNPay
                if (!isVNPayPaymentMethod(payment.getPaymentMethod())) {
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Payment method does not require URL");
                    response.put("status", payment.getStatus().name());
                    return ResponseEntity.ok(response);
                }
                
                try {
                    // Create ProcessPaymentRequest from existing payment
                    ProcessPaymentRequest processRequest = ProcessPaymentRequest.builder()
                            .transactionId(payment.getTransactionId())
                            .userId(payment.getUserId())
                            .orderId(payment.getOrderId())
                            .totalAmount(Integer.valueOf(payment.getAmount()))
                            .paymentMethod(payment.getPaymentMethod())
                            .clientIpAddress(clientIpAddress)
                            .build();
                    
                    InitiateVNPayPaymentResponseDto response = paymentService.processPayment(processRequest);
                    
                    if (response != null && response.getPaymentUrl() != null) {
                        log.info("Successfully generated payment URL for transactionId: {}", transactionId);
                        return ResponseEntity.ok(response);
                    } else {
                        Map<String, String> errorResponse = new HashMap<>();
                        errorResponse.put("error", "Failed to generate payment URL");
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                    }
                    
                } catch (Exception e) {
                    log.error("Error generating payment URL for transactionId: {}. Error: {}", 
                            transactionId, e.getMessage());
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Failed to generate payment URL: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment status does not allow URL generation");
            response.put("status", payment.getStatus().name());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Unexpected error getting payment URL for transactionId: {}", transactionId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error while getting payment URL");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Endpoint để check status của payment bằng transaction ID
     * Frontend có thể polling API này để đợi payment được tạo sau checkout
     *
     * @param transactionId Transaction ID từ checkout response
     * @return ResponseEntity chứa payment status
     */
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String transactionId) {
        log.info("Request to get payment status for transactionId: {}", transactionId);
        
        try {
            Optional<Payment> paymentOptional = paymentService.findPaymentByTransactionId(transactionId);
            
            Map<String, Object> response = new HashMap<>();
            
            if (paymentOptional.isEmpty()) {
                response.put("exists", false);
                response.put("message", "Payment not yet created for this transaction");
                return ResponseEntity.ok(response);
            }
            
            Payment payment = paymentOptional.get();
            response.put("exists", true);
            response.put("status", payment.getStatus().name());
            response.put("paymentMethod", payment.getPaymentMethod().name());
            response.put("amount", payment.getAmount());
            response.put("orderId", payment.getOrderId());
            response.put("userId", payment.getUserId());
            
            if (payment.getFailureReason() != null) {
                response.put("failureReason", payment.getFailureReason());
            }
            
            log.info("Payment status for transactionId {}: {}", transactionId, payment.getStatus());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting payment status for transactionId: {}", transactionId, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error while getting payment status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Utility method để lấy IP address của client
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Helper method để kiểm tra payment method có support VNPay không
     */
    private boolean isVNPayPaymentMethod(Payment.PaymentMethod paymentMethod) {
        return Payment.PaymentMethod.CREDIT_CARD.equals(paymentMethod) ||
               Payment.PaymentMethod.DEBIT_CARD.equals(paymentMethod) ||
               Payment.PaymentMethod.QR_CODE.equals(paymentMethod) ||
               Payment.PaymentMethod.TRANSFER_BANKING.equals(paymentMethod);
    }
}