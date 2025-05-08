package com.eazybytes.service;

import com.eazybytes.dto.CartItemIdentifier;
import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.OrderConfirmationNotification;
import com.eazybytes.event.OrderEventProducer;
import com.eazybytes.event.model.*;
import com.eazybytes.model.Order;
import com.eazybytes.model.OrderItem;
import com.eazybytes.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderEventProducer orderEventProducer;

    @Override
    @Transactional
    public void processCheckoutInitiated(CheckoutInitiatedEvent event) {
        log.info("Processing CheckoutInitiatedEvent for user: {} with transactionId: {}", event.getUserId(), event.getTransactionId());

        try {
            Order order = new Order();
            order.setUserId(event.getUserId());
            order.setShippingAddress(event.getShippingAddress());
            order.setPaymentMethod(Order.PaymentMethod.valueOf(event.getPaymentMethod()));
            order.setStatus(Order.OrderStatus.RESERVING); // Trạng thái ban đầu

            List<OrderItem> items = event.getCartItems().stream()
                    .map(item -> new OrderItem(
                            item.getProductId(),
                            item.getColor(),
                            item.getProductName(),
                            item.getQuantity(),
                            (int)item.getPrice()))
                    .collect(Collectors.toList());
            items.forEach(order::addItem);
            order.setTotalAmount(calculateTotalPrice(items));

            Order savedOrder = orderRepository.save(order);
            log.info("Order created with ID: {} for user: {}", savedOrder.getId(), event.getUserId());

            // Gửi yêu cầu giữ sản phẩm
            ReserveInventoryRequest reserveRequest = ReserveInventoryRequest.builder()
                    .transactionId(event.getTransactionId())
                    .orderId(savedOrder.getId().toString())
                    .items(event.getCartItems())
                    .build();
            orderEventProducer.sendReserveInventoryRequest(reserveRequest);
            log.info("ReserveInventoryRequest sent for orderId: {}", savedOrder.getId());

        } catch (Exception e) {
            log.error("Failed to process CheckoutInitiatedEvent: {}", e.getMessage(), e);
            CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                    .transactionId(event.getTransactionId())
                    .userId(event.getUserId())
                    .orderId(null)
                    .productIdentifiers(event.getCartItems().stream()
                            .map((CartItemResponse item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                            .collect(Collectors.toList()))
                    .reason(e.getMessage())
                    .build();
            orderEventProducer.sendCheckoutFailedEvent(failedEvent);
        }
    }

    @Transactional
    public void processInventoryReserved(InventoryReservedEvent event) {
        log.info("Processing InventoryReservedEvent for orderId: {}", event.getOrderId());
        Order order = orderRepository.findById(Long.parseLong(event.getOrderId()))
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
        order.setStatus(Order.OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        ProcessPaymentRequest paymentRequest = ProcessPaymentRequest.builder()
                .transactionId(event.getTransactionId())
                .userId(order.getUserId())
                .orderId(event.getOrderId())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod().name())
                .items(event.getItems())
                .build();
        orderEventProducer.sendProcessPaymentRequest(paymentRequest);
        log.info("ProcessPaymentRequest sent for orderId: {}", event.getOrderId());
    }

    @Transactional
    public void processInventoryReservationFailed(InventoryReservationFailedEvent event) {
        log.info("Processing InventoryReservationFailedEvent for orderId: {}", event.getOrderId());
        Order order = orderRepository.findById(Long.parseLong(event.getOrderId()))
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
        order.setStatus(Order.OrderStatus.FAILED);
        orderRepository.save(order);

        CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                .transactionId(event.getTransactionId())
                .userId(order.getUserId())
                .orderId(event.getOrderId())
                .productIdentifiers(event.getItems().stream()
                        .map((CartItemResponse item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                        .collect(Collectors.toList()))
                .reason(event.getReason())
                .build();
        orderEventProducer.sendCheckoutFailedEvent(failedEvent);
        log.info("CheckoutFailedEvent sent for orderId: {}", event.getOrderId());
    }

    @Transactional
    public void processPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Processing PaymentSucceededEvent for orderId: {}", event.getOrderId());
        Order order = orderRepository.findById(Long.parseLong(event.getOrderId()))
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
        order.setStatus(Order.OrderStatus.PROCESSING); // Hoặc COMPLETED tùy yêu cầu
        order.setPaymentId(event.getPaymentId());
        orderRepository.save(order);

        ConfirmInventoryReservationRequest confirmRequest = ConfirmInventoryReservationRequest.builder()
                .transactionId(event.getTransactionId())
                .orderId(event.getOrderId())
                .items(order.getItems().stream()
                        .map(item -> new CartItemResponse(
                            item.getProductId(),
                            item.getProductName(),
                            item.getPrice(),
                            item.getQuantity(),
                            item.getColor(),
                            true))
                        .collect(Collectors.toList()))
                .build();
        orderEventProducer.sendConfirmInventoryReservationRequest(confirmRequest);

        OrderCompletedEvent completedEvent = OrderCompletedEvent.builder()
                .transactionId(event.getTransactionId())
                .userId(order.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .selectedItems(event.getItems())
                .build();
        orderEventProducer.sendOrderCompletedEvent(completedEvent);
        log.info("OrderCompletedEvent sent for orderId: {}", event.getOrderId());
    }

    @Transactional
    public void processPaymentFailed(PaymentFailedEvent event) {
        log.info("Processing PaymentFailedEvent for orderId: {}", event.getOrderId());
        Order order = orderRepository.findById(Long.parseLong(event.getOrderId()))
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
        order.setStatus(Order.OrderStatus.FAILED);
        orderRepository.save(order);

        CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                .transactionId(event.getTransactionId())
                .orderId(event.getOrderId())
                .build();
        orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);

        CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                .transactionId(event.getTransactionId())
                .userId(order.getUserId())
                .orderId(event.getOrderId())
                .productIdentifiers(order.getItems().stream()
                        .map((OrderItem item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                        .collect(Collectors.toList()))
                .reason(event.getReason())
                .build();
        orderEventProducer.sendCheckoutFailedEvent(failedEvent);
        log.info("CheckoutFailedEvent sent for orderId: {}", event.getOrderId());
    }

    @Override
    @Transactional
    public void processCheckoutFailed(CheckoutFailedEvent event) {
        // Xử lý từ PaymentService hoặc InventoryService
        log.info("Processing CheckoutFailedEvent for orderId: {}", event.getOrderId());
        if (event.getOrderId() != null) {
            Order order = orderRepository.findById(Long.parseLong(event.getOrderId()))
                    .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
            if (!order.getStatus().equals(Order.OrderStatus.FAILED)) {
                order.setStatus(Order.OrderStatus.FAILED);
                orderRepository.save(order);
                log.info("Order updated to FAILED for orderId: {}", order.getId());

                CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                        .transactionId(event.getTransactionId())
                        .orderId(event.getOrderId())
                        .build();
                orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);
            }
        }
    }

    @Override
    @Transactional
    public void processOrderCompleted(OrderCompletedEvent event) {
        // Không cần xử lý từ PaymentService vì đã xử lý trong PaymentSucceededEvent
        log.info("Received OrderCompletedEvent for orderId: {}", event.getOrderId());
    }

    @Override
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    @Override
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == Order.OrderStatus.RESERVING || order.getStatus() == Order.OrderStatus.PAYMENT_PENDING) {
            order.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(order);
            log.info("Order cancelled: {}", orderId);

            CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                    .transactionId(UUID.randomUUID().toString())
                    .orderId(orderId.toString())
                    .build();
            orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);

            CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                    .transactionId(cancelRequest.getTransactionId())
                    .userId(order.getUserId())
                    .orderId(orderId.toString())
                    .productIdentifiers(order.getItems().stream()
                            .map((OrderItem item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                            .collect(Collectors.toList()))
                    .reason("Order cancelled by user")
                    .build();
            orderEventProducer.sendCheckoutFailedEvent(failedEvent);
        } else {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() != Order.OrderStatus.PROCESSING) {
            throw new RuntimeException("Order must be in PROCESSING status to confirm: " + orderId);
        }
        // Logic xác nhận thêm nếu cần
        List<CartItemIdentifier> identifiers = order.getItems().stream()
                .map((OrderItem item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                .collect(Collectors.toList());
        OrderConfirmationNotification notification = new OrderConfirmationNotification(order.getUserId(), identifiers);
        kafkaTemplate.send("cart-service-order-confirmed", notification);
        log.info("Order confirmed and notification sent for orderId: {}", orderId);
    }

    // Xử lý timeout (giả định dùng scheduler hoặc Kafka retry)
    @Transactional
    public void handlePaymentPendingTimeout(Long orderId, String transactionId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == Order.OrderStatus.PAYMENT_PENDING) {
            log.info("Timeout detected for orderId: {}", orderId);
            order.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(order);

            CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                    .transactionId(transactionId)
                    .orderId(orderId.toString())
                    .build();
            orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);

            CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                    .transactionId(transactionId)
                    .userId(order.getUserId())
                    .orderId(orderId.toString())
                    .productIdentifiers(order.getItems().stream()
                            .map((OrderItem item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                            .collect(Collectors.toList()))
                    .reason("Payment timeout")
                    .build();
            orderEventProducer.sendCheckoutFailedEvent(failedEvent);
        }
    }

    private Integer calculateTotalPrice(List<OrderItem> items) {
        return items.stream()
                .mapToInt(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}