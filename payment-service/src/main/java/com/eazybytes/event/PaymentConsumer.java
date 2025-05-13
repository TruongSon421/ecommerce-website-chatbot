package com.eazybytes.event;

import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentConsumer {

    private final PaymentService paymentService;

    @KafkaListener(topics = "${kafka.topics.payment.process}", groupId = "${spring.kafka.consumer.group-id}")
    public void processPaymentRequest(ProcessPaymentRequest request, Acknowledgment ack) {
        try {
            log.info("Received payment request: {}", request);
            paymentService.processPayment(request);
            ack.acknowledge();
            log.info("Successfully processed payment request for orderId: {}", request.getOrderId());
        } catch (Exception e) {
            log.error("Failed to process payment request: {}. Error: {}", request, e.getMessage(), e);
            // Don't acknowledge to let Kafka retry
        }
    }
}