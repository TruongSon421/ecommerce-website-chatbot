package com.eazybytes.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import com.eazybytes.event.model.PaymentFailedEvent;
import com.eazybytes.event.model.PaymentSucceededEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.payment.succeeded}")
    private String paymentSucceededTopic;

    @Value("${kafka.topics.payment.failed}")
    private String paymentFailedTopic;

    public void sendPaymentSucceededEvent(PaymentSucceededEvent event) {
        log.info("Sending PaymentSucceededEvent: {}", event);
        try {
            Message<PaymentSucceededEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, paymentSucceededTopic)
                    .setHeader(KafkaHeaders.KEY, event.getOrderId().toString())
                    .build();
            kafkaTemplate.send(message);
            log.info("Successfully sent PaymentSucceededEvent for orderId: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Error sending PaymentSucceededEvent for orderId {}: {}", event.getOrderId(), e.getMessage(), e);
        }
    }

    public void sendPaymentFailedEvent(PaymentFailedEvent event) {
        log.info("Sending PaymentFailedEvent: {}", event);
        try {
            Message<PaymentFailedEvent> message = MessageBuilder
                    .withPayload(event)
                    .setHeader(KafkaHeaders.TOPIC, paymentFailedTopic)
                    .setHeader(KafkaHeaders.KEY, event.getOrderId().toString())
                    .build();
            kafkaTemplate.send(message);
            log.info("Successfully sent PaymentFailedEvent for orderId: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Error sending PaymentFailedEvent for orderId {}: {}", event.getOrderId(), e.getMessage(), e);
        }
    }
}