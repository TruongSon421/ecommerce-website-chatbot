package com.eazybytes.event;

import com.eazybytes.service.CartServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartEventConsumer {

    private final CartServiceImpl cartService;

    @KafkaListener(topics = "${kafka.topics.cart-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCartEvent(CartEvent event) {
        log.info("Received cart event: {}", event);
        if ("ORDER_CONFIRMED".equals(event.getEventType())) {
            cartService.removeCheckedOutItems(event.getUserId(), event.getProductIds());
        }
    }
}