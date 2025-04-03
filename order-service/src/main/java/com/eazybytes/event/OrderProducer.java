package com.eazybytes.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.order-events}")
    private String orderEventsTopic;

    public void sendOrderEvent(OrderEvent orderEvent) {
        log.info("Sending order event: {}", orderEvent);
        try {
            kafkaTemplate.send(orderEventsTopic, orderEvent.getUserId(), orderEvent);
        } catch (Exception e) {
            log.error("Error sending order event: {}", e.getMessage());
            // Có thể thêm logic retry nếu cần
        }
    }
}