package com.eazybytes.event;


import com.eazybytes.event.model.CartClearFailedEvent;
import com.eazybytes.event.model.CartClearedEvent;
import com.eazybytes.event.model.CheckoutInitiatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // Import @Value
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CartEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Inject tên topic từ application.yml
    @Value("${kafka.topics.checkout.initiated}") // Tên thuộc tính trong application.yml
    private String checkoutInitiatedTopic;

    @Value("${kafka.topics.cart.cleared}")
    private String cartClearedTopic;

    @Value("${kafka.topics.cart.clearfailed}")
    private String cartClearFailedTopic;

    public void sendCheckoutInitiatedEvent(CheckoutInitiatedEvent event) {
        log.info("Sending CheckoutInitiatedEvent to topic '{}': {}", checkoutInitiatedTopic, event);
        try {
            // Sử dụng biến tên topic đã inject
            kafkaTemplate.send(checkoutInitiatedTopic, event.getTransactionId(), event);
        } catch (Exception e) {
            // Xử lý lỗi cơ bản: Ghi log
            log.error("Failed to send CheckoutInitiatedEvent for transactionId {}: {}",
                      event.getTransactionId(), e.getMessage(), e);
            // TODO: Xem xét thêm các chiến lược xử lý lỗi khác (retry, lưu vào DB để gửi lại,...)
        }
    }

    public void sendCartClearedEvent(CartClearedEvent event) {
        log.info("Sending CartClearedEvent to topic '{}': {}", cartClearedTopic, event);
         try {
            kafkaTemplate.send(cartClearedTopic, event.getTransactionId(), event);
        } catch (Exception e) {
            log.error("Failed to send CartClearedEvent for transactionId {}: {}",
                      event.getTransactionId(), e.getMessage(), e);
        }
    }

    public void sendCartClearFailedEvent(CartClearFailedEvent event) {
        log.info("Sending CartClearFailedEvent to topic '{}': {}", cartClearFailedTopic, event);
         try {
            kafkaTemplate.send(cartClearFailedTopic, event.getTransactionId(), event);
        } catch (Exception e) {
            log.error("Failed to send CartClearFailedEvent for transactionId {}: {}",
                      event.getTransactionId(), e.getMessage(), e);
        }
    }
}