package com.eazybytes.service;

import com.eazybytes.event.PaymentProducer;
import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.event.model.PaymentSucceededEvent;
import com.eazybytes.event.model.PaymentFailedEvent;
import com.eazybytes.model.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Interface defining payment service operations
 */
public interface PaymentService {
    
    /**
     * Handles a payment request from the order service
     * 
     * @param request The payment request containing order and payment details
     */
    void handlePaymentRequest(ProcessPaymentRequest request);
    
    /**
     * Retrieves payment information for a specific order
     * 
     * @param orderId The ID of the order
     * @return Payment information for the specified order
     */
    Payment getPaymentByOrderId(Long orderId);
}