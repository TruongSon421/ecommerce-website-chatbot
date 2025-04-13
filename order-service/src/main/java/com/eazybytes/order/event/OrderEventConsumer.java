package com.eazybytes.order.event;

import com.eazybytes.order.event.model.*;
import com.eazybytes.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final OrderService orderService;

    @KafkaListener(topics = "${kafka.topics.checkout-initiated}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCheckoutInitiatedEvent(CheckoutInitiatedEvent event, Acknowledgment ack) {
        log.info("Received CheckoutInitiatedEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processCheckoutInitiated(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process CheckoutInitiatedEvent: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "${kafka.topics.inventory-reserved}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeInventoryReservedEvent(InventoryReservedEvent event, Acknowledgment ack) {
        log.info("Received InventoryReservedEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processInventoryReserved(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process InventoryReservedEvent: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "${kafka.topics.inventory-reservation-failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeInventoryReservationFailedEvent(InventoryReservationFailedEvent event, Acknowledgment ack) {
        log.info("Received InventoryReservationFailedEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processInventoryReservationFailed(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process InventoryReservationFailedEvent: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment-succeeded}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentSucceededEvent(PaymentSucceededEvent event, Acknowledgment ack) {
        log.info("Received PaymentSucceededEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processPaymentSucceeded(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process PaymentSucceededEvent: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "${kafka.topics.payment-failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentFailedEvent(PaymentFailedEvent event, Acknowledgment ack) {
        log.info("Received PaymentFailedEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processPaymentFailed(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process PaymentFailedEvent: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "${kafka.topics.order-completed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeOrderCompletedEvent(OrderCompletedEvent event, Acknowledgment ack) {
        log.info("Received OrderCompletedEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processOrderCompleted(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process OrderCompletedEvent: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "${kafka.topics.checkout-failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCheckoutFailedEvent(CheckoutFailedEvent event, Acknowledgment ack) {
        log.info("Received CheckoutFailedEvent with transactionId: {}", event.getTransactionId());
        try {
            orderService.processCheckoutFailed(event);
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process CheckoutFailedEvent: {}", e.getMessage());
        }
    }
}