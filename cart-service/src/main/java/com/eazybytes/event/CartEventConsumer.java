package com.eazybytes.event;


import com.eazybytes.event.model.CartClearFailedEvent;
import com.eazybytes.event.model.CartClearedEvent;
import com.eazybytes.event.model.CheckoutFailedEvent;
import com.eazybytes.event.model.OrderCompletedEvent;
import com.eazybytes.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartEventConsumer {

    private final CartService cartService;
    private final CartEventProducer cartEventProducer; 

    @KafkaListener(topics = "${kafka.topics.order.completed}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderCompleted(OrderCompletedEvent event, Acknowledgment ack) {
        log.info("Received OrderCompletedEvent: {}", event);
        try {
            cartService.finalizeSuccessfulCheckout(event);
            cartEventProducer.sendCartClearedEvent(new CartClearedEvent(event.getTransactionId(), event.getUserId()));
            ack.acknowledge(); // Xác nhận khi thành công
            log.info("Successfully processed OrderCompletedEvent for transactionId: {}", event.getTransactionId());
        } catch (Exception e) {
            log.error("Error processing OrderCompletedEvent for transactionId {}: {}", event.getTransactionId(), e.getMessage(), e);
            // Không ack để retry, hoặc có thể gửi CartClearFailedEvent
            cartEventProducer.sendCartClearFailedEvent(new CartClearFailedEvent(event.getTransactionId(), event.getUserId(), e.getMessage()));
        }
    }

    @KafkaListener(topics = "${kafka.topics.checkout.failed}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleCheckoutFailed(CheckoutFailedEvent event, Acknowledgment ack) {
        log.warn("Received CheckoutFailedEvent: {}", event);
        try {
            cartService.compensateFailedCheckout(event);
            ack.acknowledge(); // Xác nhận khi bù trừ thành công
            log.info("Successfully processed CheckoutFailedEvent for transactionId: {}", event.getTransactionId());
        } catch (Exception e) {
            log.error("Error processing CheckoutFailedEvent for transactionId {}: {}", event.getTransactionId(), e.getMessage(), e);
            ack.acknowledge(); // Giữ như bạn để tránh lặp vô hạn
        }
    }
}