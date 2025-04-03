package com.eazybytes.service;

import com.eazybytes.event.OrderEvent;
import com.eazybytes.event.OrderProducer;
import com.eazybytes.model.Order;
import com.eazybytes.model.OrderItem;
import com.eazybytes.repository.OrderRepository;
import com.eazybytes.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.requestreply.RequestReplyFuture;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ReplyingKafkaTemplate<String, Object, Object> replyingKafkaTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderProducer orderProducer;

    @Override
    @Transactional
    public Order createOrder(String userId, String shippingAddress) throws Exception {
        // Tạo ProducerRecord cho request-reply
        ProducerRecord<String, Object> record = new ProducerRecord<>(
                "cart-service-get-cart",  // Topic
                userId,                   // Key
                new GetCartRequest(userId) // Value
        );

        // Gửi yêu cầu và nhận phản hồi
        RequestReplyFuture<String, Object, Object> future = replyingKafkaTemplate.sendAndReceive(record);
        CartDetailsResponse cartResponse = (CartDetailsResponse) future.get(10, TimeUnit.SECONDS).value();

        // Tạo đơn hàng từ dữ liệu giỏ hàng
        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(shippingAddress);
        order.setStatus(Order.OrderStatus.CREATED);
        order.setTotalAmount(cartResponse.getTotalPrice());

        List<OrderItem> orderItems = cartResponse.getItems().stream()
                .map(cartItem -> new OrderItem(
                        cartItem.getProductId(),
                        cartItem.getColor(),
                        cartItem.getProductName(),
                        cartItem.getQuantity(),
                        cartItem.getPrice()))
                .toList();
        orderItems.forEach(order::addItem);

        // Lưu đơn hàng
        order = orderRepository.save(order);
        log.info("Order created for user: {}, orderId: {}", userId, order.getId());

        // Gửi sự kiện ORDER_CREATED
        List<OrderEvent.OrderItemDetails> eventItems = orderItems.stream()
                .map(item -> new OrderEvent.OrderItemDetails(
                        item.getProductId(), item.getColor(), item.getProductName(), item.getQuantity(), item.getPrice()))
                .collect(Collectors.toList());
        orderProducer.sendOrderEvent(new OrderEvent(
                "ORDER_CREATED", order.getId(), userId, eventItems, order.getTotalAmount(), order.getStatus().name()));

        // Gửi yêu cầu thanh toán
        kafkaTemplate.send("payment-service-process-payment", new PaymentRequest(order.getId(), order.getTotalAmount()));
        return order;
    }

    @Override
    public Order getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    @Override
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == Order.OrderStatus.CREATED || order.getStatus() == Order.OrderStatus.PAYMENT_PENDING) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            order = orderRepository.save(order);
            log.info("Order cancelled: {}", orderId);

            List<OrderEvent.OrderItemDetails> eventItems = order.getItems().stream()
                    .map(item -> new OrderEvent.OrderItemDetails(
                            item.getProductId(), item.getColor(), item.getProductName(), item.getQuantity(), item.getPrice()))
                    .collect(Collectors.toList());
            orderProducer.sendOrderEvent(new OrderEvent(
                    "ORDER_CANCELLED", orderId, order.getUserId(), eventItems, order.getTotalAmount(), order.getStatus().name()));
        } else {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }
    }

    @Override
    @Transactional
    public void confirmOrder(UUID orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() != Order.OrderStatus.PAYMENT_COMPLETED) {
            throw new RuntimeException("Order must be in PAYMENT_COMPLETED status to confirm: " + orderId);
        }
        order.setStatus(Order.OrderStatus.PROCESSING);
        order = orderRepository.save(order);

        List<CartItemIdentifier> identifiers = order.getItems().stream()
                .map(item -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                .collect(Collectors.toList());
        OrderConfirmationNotification notification = new OrderConfirmationNotification(order.getUserId(), identifiers);
        kafkaTemplate.send("cart-service-order-confirmed", notification);
        log.info("Order confirmed and notification sent for orderId: {}", orderId);

        List<OrderEvent.OrderItemDetails> eventItems = order.getItems().stream()
                .map(item -> new OrderEvent.OrderItemDetails(
                        item.getProductId(), item.getColor(), item.getProductName(), item.getQuantity(), item.getPrice()))
                .collect(Collectors.toList());
        orderProducer.sendOrderEvent(new OrderEvent(
                "ORDER_CONFIRMED", orderId, order.getUserId(), eventItems, order.getTotalAmount(), order.getStatus().name()));
    }
}