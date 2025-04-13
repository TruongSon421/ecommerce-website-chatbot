package com.eazybytes.payment.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent {
    private String eventType;        // PAYMENT_REQUESTED, PAYMENT_SUCCESS, PAYMENT_FAILED
    private UUID orderId;            // ID đơn hàng
    private String paymentId;        // ID thanh toán (giả lập)
    private String amount;           // Số tiền (String)
    private String status;           // Trạng thái thanh toán
    private LocalDateTime timestamp; // Thời gian sự kiện

    public PaymentEvent(String eventType, UUID orderId, String amount, String status) {
        this.eventType = eventType;
        this.orderId = orderId;
        this.amount = amount;
        this.status = status;
        this.paymentId = UUID.randomUUID().toString(); // Giả lập paymentId
        this.timestamp = LocalDateTime.now();
    }
}