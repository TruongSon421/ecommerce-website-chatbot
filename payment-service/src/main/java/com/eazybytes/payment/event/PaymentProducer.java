package com.eazybytes.payment.event;

import com.eazybytes.payment.event.model.PaymentFailedEvent;   // Import event mới
import com.eazybytes.payment.event.model.PaymentSucceededEvent; // Import event mới
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Định nghĩa các topic mới trong application.yml
    @Value("${kafka.topics.payment-succeeded}")
    private String paymentSucceededTopic;

    @Value("${kafka.topics.payment-failed}")
    private String paymentFailedTopic;

    // Giữ lại producer cũ nếu vẫn cần
    @Value("${kafka.topics.payment-service-reply}")
    private String paymentServiceReplyTopic;

    public void sendPaymentSucceededEvent(PaymentSucceededEvent event) {
        log.info("Sending PaymentSucceededEvent: {}", event);
        try {
            Message<PaymentSucceededEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, paymentSucceededTopic)
                    .setHeader(KafkaHeaders.KEY, event.getOrderId().toString()) // Key bằng orderId hoặc transactionId
                    .build();
            kafkaTemplate.send(message);
        } catch (Exception e) {
            log.error("Error sending PaymentSucceededEvent for transactionId {}: {}", event.getTransactionId(), e.getMessage(), e);
            // Cân nhắc cơ chế retry hoặc báo lỗi
        }
    }

    public void sendPaymentFailedEvent(PaymentFailedEvent event) {
        log.info("Sending PaymentFailedEvent: {}", event);
        try {
            Message<PaymentFailedEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, paymentFailedTopic)
                    .setHeader(KafkaHeaders.KEY, event.getOrderId().toString()) // Key bằng orderId hoặc transactionId
                    .build();
            kafkaTemplate.send(message);
        } catch (Exception e) {
            log.error("Error sending PaymentFailedEvent for transactionId {}: {}", event.getTransactionId(), e.getMessage(), e);
             // Cân nhắc cơ chế retry hoặc báo lỗi
        }
    }

     // Giữ lại phương thức cũ nếu bạn vẫn dùng topic payment-service-reply cho mục đích khác
    public void sendPaymentEvent(PaymentEvent paymentEvent) {
        log.warn("Sending generic PaymentEvent (consider using specific events): {}", paymentEvent);
        try {
            kafkaTemplate.send(paymentServiceReplyTopic, paymentEvent.getOrderId().toString(), paymentEvent);
        } catch (Exception e) {
            log.error("Error sending generic PaymentEvent: {}", e.getMessage());
        }
    }
}