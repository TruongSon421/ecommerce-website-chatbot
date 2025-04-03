package com.eazybytes.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate; // Cập nhật kiểu

    @Value("${kafka.topics.cart-events}")
    private String cartEventsTopic;

    public void sendCartEvent(CartEvent cartEvent) {
        log.info("Sending cart event: {}", cartEvent);
        try {
            kafkaTemplate.send(cartEventsTopic, cartEvent.getUserId(), cartEvent);
        } catch (Exception e) {
            log.error("Error sending cart event: {}", e.getMessage());
            // Có thể thêm logic retry nếu cần
        }
    }
}