package com.eazybytes.event;

import com.eazybytes.event.model.*;
import com.eazybytes.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final OrderService orderService;
    

    @KafkaListener(topics = "${kafka.topics.checkout.initiated}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCheckoutInitiatedEvent(
            @Payload CheckoutInitiatedEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment ack) {
        log.info("Received message from topic: {}, partition: {}, offset: {}", topic, partition, offset);
        log.info("Received event: {}", event);
        
        try {
            // Process the event directly
            orderService.processCheckoutInitiated(event);
            log.info("Successfully processed event");
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process message: {}", e.getMessage(), e);
            // Still acknowledge to avoid getting stuck
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.inventory.reserved}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeInventoryReservedEvent(
            @Payload InventoryReservedEvent event,
            Acknowledgment ack) {
        log.info("Received InventoryReservedEvent: {}", event);
        try {
            orderService.processInventoryReserved(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process InventoryReservedEvent: {}", e.getMessage(), e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.inventory.reservation-failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeInventoryReservationFailedEvent(
            @Payload InventoryReservationFailedEvent event,
            Acknowledgment ack) {
        log.info("Received InventoryReservationFailedEvent: {}", event);
        try {
            orderService.processInventoryReservationFailed(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process InventoryReservationFailedEvent: {}", e.getMessage(), e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment.succeeded}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentSucceededEvent(
            @Payload PaymentSucceededEvent event,
            Acknowledgment ack) {
        log.info("Received PaymentSucceededEvent: {}", event);
        try {
            orderService.processPaymentSucceeded(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process PaymentSucceededEvent: {}", e.getMessage(), e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment.failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentFailedEvent(
            @Payload PaymentFailedEvent event,
            Acknowledgment ack) {
        log.info("Received PaymentFailedEvent: {}", event);
        try {
            orderService.processPaymentFailed(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process PaymentFailedEvent: {}", e.getMessage(), e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.order.completed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeOrderCompletedEvent(
            @Payload OrderCompletedEvent event,
            Acknowledgment ack) {
        log.info("Received OrderCompletedEvent: {}", event);
        try {
            orderService.processOrderCompleted(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process OrderCompletedEvent: {}", e.getMessage(), e);
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.checkout.failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCheckoutFailedEvent(
            @Payload CheckoutFailedEvent event,
            Acknowledgment ack) {
        log.info("Received CheckoutFailedEvent: {}", event);
        try {
            orderService.processCheckoutFailed(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process CheckoutFailedEvent: {}", e.getMessage(), e);
            ack.acknowledge();
        }
    }
}