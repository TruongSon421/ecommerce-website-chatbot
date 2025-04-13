package com.eazybytes.order.event;

import com.eazybytes.order.event.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendReserveInventoryRequest(ReserveInventoryRequest request) {
        log.info("Sending ReserveInventoryRequest with transactionId: {}", request.getTransactionId());
        kafkaTemplate.send("reserve-inventory-request", request.getTransactionId(), request);
    }

    public void sendProcessPaymentRequest(ProcessPaymentRequest request) {
        log.info("Sending ProcessPaymentRequest with transactionId: {}", request.getTransactionId());
        kafkaTemplate.send("process-payment-request", request.getTransactionId(), request);
    }

    public void sendConfirmInventoryReservationRequest(ConfirmInventoryReservationRequest request) {
        log.info("Sending ConfirmInventoryReservationRequest with transactionId: {}", request.getTransactionId());
        kafkaTemplate.send("confirm-inventory-reservation", request.getTransactionId(), request);
    }

    public void sendCancelInventoryReservationRequest(CancelInventoryReservationRequest request) {
        log.info("Sending CancelInventoryReservationRequest with transactionId: {}", request.getTransactionId());
        kafkaTemplate.send("cancel-inventory-reservation", request.getTransactionId(), request);
    }

    public void sendOrderCompletedEvent(OrderCompletedEvent event) {
        log.info("Sending OrderCompletedEvent with transactionId: {}", event.getTransactionId());
        kafkaTemplate.send("order-completed", event.getTransactionId(), event);
    }

    public void sendCheckoutFailedEvent(CheckoutFailedEvent event) {
        log.info("Sending CheckoutFailedEvent with transactionId: {}", event.getTransactionId());
        kafkaTemplate.send("checkout-failed", event.getTransactionId(), event);
    }
}