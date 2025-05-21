package com.eazybytes.service;

import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.model.Payment;

public interface PaymentService {
    void processPayment(ProcessPaymentRequest request);
    Payment getPaymentByOrderId(Long orderId);
}