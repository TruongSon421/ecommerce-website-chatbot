package com.eazybytes.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.eazybytes.event.model.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Inject topic names from application.yml
    @Value("${kafka.topics.reserve-inventory-request}")
    private String reserveInventoryRequestTopic;

    @Value("${kafka.topics.process-payment-request}")
    private String processPaymentRequestTopic;

    @Value("${kafka.topics.confirm-inventory-reservation}")
    private String confirmInventoryReservationTopic;

    @Value("${kafka.topics.cancel-inventory-reservation}")
    private String cancelInventoryReservationTopic;

    @Value("${kafka.topics.order.completed}")
    private String orderCompletedTopic;

    @Value("${kafka.topics.checkout.failed}")
    private String checkoutFailedTopic;

    public void sendReserveInventoryRequest(ReserveInventoryRequest request) {
        log.info("Sending ReserveInventoryRequest with transactionId: {} to topic: {}", 
                request.getTransactionId(), reserveInventoryRequestTopic);
        kafkaTemplate.send(reserveInventoryRequestTopic, request.getTransactionId(), request);
    }

    public void sendProcessPaymentRequest(ProcessPaymentRequest request) {
        log.info("Sending ProcessPaymentRequest with transactionId: {} to topic: {}", 
                request.getTransactionId(), processPaymentRequestTopic);
        kafkaTemplate.send(processPaymentRequestTopic, request.getTransactionId(), request);
    }

    public void sendConfirmInventoryReservationRequest(ConfirmInventoryReservationRequest request) {
        log.info("Sending ConfirmInventoryReservationRequest with transactionId: {} to topic: {}", 
                request.getTransactionId(), confirmInventoryReservationTopic);
        kafkaTemplate.send(confirmInventoryReservationTopic, request.getTransactionId(), request);
    }

    public void sendCancelInventoryReservationRequest(CancelInventoryReservationRequest request) {
        log.info("Sending CancelInventoryReservationRequest with transactionId: {} to topic: {}", 
                request.getTransactionId(), cancelInventoryReservationTopic);
        kafkaTemplate.send(cancelInventoryReservationTopic, request.getTransactionId(), request);
    }

    public void sendOrderCompletedEvent(OrderCompletedEvent event) {
        log.info("Sending OrderCompletedEvent with transactionId: {} to topic: {}", 
                event.getTransactionId(), orderCompletedTopic);
        kafkaTemplate.send(orderCompletedTopic, event.getTransactionId(), event);
    }

    public void sendCheckoutFailedEvent(CheckoutFailedEvent event) {
        log.info("Sending CheckoutFailedEvent with transactionId: {} to topic: {}", 
                event.getTransactionId(), checkoutFailedTopic);
        kafkaTemplate.send(checkoutFailedTopic, event.getTransactionId(), event);
    }
}