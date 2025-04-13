package com.eazybytes.payment.event;

import com.eazybytes.payment.event.model.ProcessPaymentRequest; // Import DTO mới
import com.eazybytes.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment; // Import Acknowledgment
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentConsumer {

    private final PaymentService paymentService;

    // Đổi topic và kiểu dữ liệu event lắng nghe
    @KafkaListener(topics = "${kafka.topics.process-payment-request}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentRequest(ProcessPaymentRequest event, Acknowledgment ack) { // Thêm Acknowledgment
        log.info("Received ProcessPaymentRequest: {}", event);
        try {
            // Gọi service để xử lý request
            paymentService.handlePaymentRequest(event);
            ack.acknowledge(); // Xác nhận thủ công sau khi xử lý thành công
            log.info("Successfully processed ProcessPaymentRequest for transactionId: {}", event.getTransactionId());
        } catch (Exception e) {
            // Log lỗi chi tiết
            log.error("Failed to process ProcessPaymentRequest for transactionId: {}. Error: {}", event.getTransactionId(), e.getMessage(), e);
            // Không ack để Kafka retry hoặc gửi vào DLQ (tùy cấu hình)
        }
    }
}