package com.eazybytes.event;

import com.eazybytes.event.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class InventoryProducerEvent {
    private static final Logger logger = LoggerFactory.getLogger(InventoryProducerEvent.class);
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.inventory.reserved:inventory-reserved}")
    private String inventoryReservedTopic;

    @Value("${kafka.topics.inventory.reservation-failed:inventory-reservation-failed}")
    private String inventoryReservationFailedTopic;

    @Value("${kafka.topics.inventory.confirmed:inventory-confirmed}")
    private String inventoryConfirmedTopic;

    public void sendInventoryEvent(InventoryEvent event) {
        String key = event.getTransactionId();
        String topic;

        // Determine the correct topic based on event type
        if (event instanceof InventoryReservedEvent) {
            topic = inventoryReservedTopic;
        } else if (event instanceof InventoryReservationFailedEvent) {
            topic = inventoryReservationFailedTopic;
        } else if (event instanceof InventoryConfirmedEvent) {
            topic = inventoryConfirmedTopic;
        } else {
            logger.error("Unknown event type: {}", event.getClass().getName());
            return;
        }

        try {
            kafkaTemplate.send(topic, key, event);
            logger.info("Sent event to topic: {}", topic);
        } catch (Exception e) {
            logger.error("Failed to send event to topic {}: {}", topic, e.getMessage());
        }
    }
}