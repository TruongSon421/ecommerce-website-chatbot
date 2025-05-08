package com.eazybytes.service;

import com.eazybytes.event.PaymentProducer;
import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.event.model.PaymentSucceededEvent;
import com.eazybytes.event.model.PaymentFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentProducer paymentProducer;

    // Phương thức xử lý yêu cầu thanh toán từ Saga
    public void processPayment(ProcessPaymentRequest request) {
        log.info("Processing payment for orderId: {}", request.getOrderId());
        try {
            // TODO: Implement actual payment processing logic here
            // For now, simulate successful payment
            boolean paymentSuccess = processPaymentWithProvider(request);

            if (paymentSuccess) {
                PaymentSucceededEvent successEvent = new PaymentSucceededEvent(
                    request.getOrderId(),
                    UUID.randomUUID().toString(), // payment ID
                    request.getAmount(),
                    request.getCurrency(),
                    request.getPaymentMethod(),
                    LocalDateTime.now(),
                    generateTransactionId()
                );
                paymentProducer.sendPaymentSucceededEvent(successEvent);
                log.info("Payment processed successfully for orderId: {}", request.getOrderId());
            } else {
                throw new RuntimeException("Payment processing failed");
            }
        } catch (Exception e) {
            log.error("Payment processing failed for orderId: {}. Error: {}", 
                request.getOrderId(), e.getMessage());
            
            PaymentFailedEvent failedEvent = new PaymentFailedEvent(
                request.getOrderId(),
                "PAYMENT_PROCESSING_ERROR",
                e.getMessage(),
                request.getAmount(),
                request.getCurrency(),
                request.getPaymentMethod(),
                LocalDateTime.now()
            );
            paymentProducer.sendPaymentFailedEvent(failedEvent);
        }
    }

    private boolean processPaymentWithProvider(ProcessPaymentRequest request) {
        // TODO: Implement actual payment provider integration
        // For now, return true to simulate successful payment
        return true;
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString();
    }
}