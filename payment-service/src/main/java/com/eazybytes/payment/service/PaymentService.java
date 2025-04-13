package com.eazybytes.payment.service;

import com.eazybytes.payment.event.model.ProcessPaymentRequest; // Import DTO mới
import com.eazybytes.payment.model.Payment;

import java.util.UUID;

public interface PaymentService {

    // Phương thức xử lý yêu cầu thanh toán từ Saga
    void handlePaymentRequest(ProcessPaymentRequest request);

    Payment getPaymentByOrderId(UUID orderId);

   
}