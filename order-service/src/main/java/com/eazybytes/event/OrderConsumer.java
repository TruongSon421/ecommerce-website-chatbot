package com.eazybytes.event;

import com.eazybytes.model.Order;
import com.eazybytes.service.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.eazybytes.dto.PaymentResponse;
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderConsumer {

    private final OrderServiceImpl orderService;

    @KafkaListener(topics = "${kafka.topics.payment-service-reply}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumePaymentResponse(PaymentResponse paymentResponse) {
        try {
            log.info("Received payment response: {}", paymentResponse);
            Order order = orderService.getOrderById(paymentResponse.getOrderId());

            if ("PAYMENT_SUCCESS".equals(paymentResponse.getStatus())) {
                order.setStatus(Order.OrderStatus.PAYMENT_COMPLETED);
                order.setPaymentId(paymentResponse.getPaymentId());
                orderService.confirmOrder(order.getId());
                log.info("Payment completed and order confirmed for orderId: {}", order.getId());
            } else if ("PAYMENT_FAILED".equals(paymentResponse.getStatus())) {
                order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
                orderService.getOrderById(order.getId()); // Cập nhật trạng thái mà không xác nhận
                log.warn("Payment failed for orderId: {}", order.getId());
            }
        } catch (Exception e) {
            log.error("Error processing payment response: {}", e.getMessage());
        }
    }
}