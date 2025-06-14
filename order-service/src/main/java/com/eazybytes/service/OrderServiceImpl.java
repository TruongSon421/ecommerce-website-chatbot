package com.eazybytes.service;

import com.eazybytes.dto.CartItemIdentifier;
import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.OrderConfirmationNotification;
import com.eazybytes.dto.UserPurchaseHistoryResponseDto;
import com.eazybytes.event.OrderEventProducer;
import com.eazybytes.event.model.*;
import com.eazybytes.model.Order;
import com.eazybytes.model.OrderItem;
import com.eazybytes.repository.OrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
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
            order.setTransactionId(event.getTransactionId());
            order.setUserId(event.getUserId());
            order.setShippingAddress(event.getShippingAddress());
            order.setPaymentMethod(Order.PaymentMethod.valueOf(event.getPaymentMethod()));
            order.setStatus(Order.OrderStatus.RESERVING); // Trạng thái ban đầu

            List<OrderItem> items = event.getCartItems().stream()
                    .map(item -> {
                        OrderItem orderItem = new OrderItem(
                                item.getProductId(),
                                normalizeColor(item.getColor()),
                                item.getProductName(),
                                item.getQuantity(),
                                (int)item.getPrice());
                        orderItem.setOrder(order); // Explicitly set the order relationship
                        return orderItem;
                    })
                    .collect(Collectors.toList());
            order.getItems().addAll(items);
            order.setTotalAmount(calculateTotalPrice(items));

            Order savedOrder = orderRepository.save(order);
            log.info("Order created with ID: {} for user: {}", savedOrder.getId(), event.getUserId());

            // Chuẩn hóa color trước khi gửi yêu cầu giữ sản phẩm
            List<CartItemResponse> normalizedCartItems = event.getCartItems().stream()
                    .map(item -> {
                        CartItemResponse normalizedItem = new CartItemResponse(
                                item.getProductId(),
                                item.getProductName(),
                                item.getPrice(),
                                item.getQuantity(),
                                normalizeColor(item.getColor()),
                                item.isAvailable()
                        );
                        return normalizedItem;
                    })
                    .collect(Collectors.toList());

            // Gửi yêu cầu giữ sản phẩm
            ReserveInventoryRequest reserveRequest = ReserveInventoryRequest.builder()
                    .transactionId(event.getTransactionId())
                    .orderId(savedOrder.getId().toString())
                    .items(normalizedCartItems)
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
                            .map((CartItemResponse item) -> new CartItemIdentifier(item.getProductId(), normalizeColor(item.getColor())))
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
        
        // Skip if the order is already past the RESERVING state to prevent duplicate processing
        if (order.getStatus() != Order.OrderStatus.RESERVING) {
            log.warn("Order {} already processed beyond RESERVING state (current state: {}). Skipping to prevent duplicate processing.", 
                    event.getOrderId(), order.getStatus());
            return;
        }
        
        order.setStatus(Order.OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        ProcessPaymentRequest paymentRequest = ProcessPaymentRequest.builder()
                .transactionId(event.getTransactionId())
                .userId(order.getUserId())
                .orderId(event.getOrderId())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod().name())
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
                        .map((CartItemResponse item) -> new CartItemIdentifier(item.getProductId(), normalizeColor(item.getColor())))
                        .collect(Collectors.toList()))
                .reason(event.getReason())
                .build();
        orderEventProducer.sendCheckoutFailedEvent(failedEvent);
        log.info("CheckoutFailedEvent sent for orderId: {}", event.getOrderId());
    }

    @Transactional
    public void processPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Processing PaymentSucceededEvent for orderId: {}", event.getOrderId());
        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
                
        // Skip if the order is already in PAYMENT_COMPLETED status to prevent duplicate processing
        if (order.getStatus() == Order.OrderStatus.PAYMENT_COMPLETED) {
            log.warn("Order {} already processed with PAYMENT_COMPLETED status. Skipping to prevent duplicate confirmation.", event.getOrderId());
            return;
        }
        
        order.setStatus(Order.OrderStatus.PAYMENT_COMPLETED);
        order.setPaymentId(event.getPaymentId());
        orderRepository.save(order);

        // Save order first to ensure status is updated before sending message
        // This helps prevent duplicate confirmInventoryReservation requests in case of retries
        ConfirmInventoryReservationRequest confirmRequest = ConfirmInventoryReservationRequest.builder()
                .transactionId(event.getTransactionId())
                .orderId(event.getOrderId().toString())
                .items(order.getItems().stream()
                        .map(item -> new CartItemResponse(
                            item.getProductId(),
                            item.getProductName(),
                            item.getPrice(),
                            item.getQuantity(),
                            normalizeColor(item.getColor()),
                            true))
                        .collect(Collectors.toList()))
                .build();
        orderEventProducer.sendConfirmInventoryReservationRequest(confirmRequest);

        // Convert order items to CartItemResponse list for the completed event
        List<CartItemResponse> cartItems = order.getItems().stream()
                .map(item -> new CartItemResponse(
                    item.getProductId(),
                    item.getProductName(),
                    item.getPrice(),
                    item.getQuantity(),
                    normalizeColor(item.getColor()),
                    true))
                .collect(Collectors.toList());

        OrderCompletedEvent completedEvent = OrderCompletedEvent.builder()
                .transactionId(event.getTransactionId())
                .userId(event.getUserId())
                .orderId(event.getOrderId().toString())
                .paymentId(event.getPaymentId())
                .selectedItems(cartItems)
                .build();
        orderEventProducer.sendOrderCompletedEvent(completedEvent);
        log.info("OrderCompletedEvent sent for orderId: {}", event.getOrderId());
    }

    @Transactional
    public void processPaymentFailed(PaymentFailedEvent event) {
        log.info("Processing PaymentFailedEvent for orderId: {}", event.getOrderId());
        Order order = orderRepository.findById(event.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + event.getOrderId()));
        
        // Skip if already processed to avoid duplicate messages
        if (order.getStatus() == Order.OrderStatus.PAYMENT_FAILED || 
            order.getStatus() == Order.OrderStatus.FAILED) {
            log.warn("Order {} already in {} status. Skipping to prevent duplicate processing.", 
                    event.getOrderId(), order.getStatus());
            return;
        }
        
        // Capture current state for logging
        Order.OrderStatus previousStatus = order.getStatus();
        
        // Update order status
        order.setStatus(Order.OrderStatus.PAYMENT_FAILED);
        orderRepository.save(order);
        log.info("Order status updated from {} to PAYMENT_FAILED for orderId: {}", 
                previousStatus, event.getOrderId());

        // Always send cancel inventory request when payment fails 
        // (as we know inventory was previously reserved)
        CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                .transactionId(event.getTransactionId())
                .orderId(event.getOrderId().toString())
                .build();
        orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);
        log.info("CancelInventoryReservationRequest sent for orderId: {}", event.getOrderId());

        CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                .transactionId(event.getTransactionId())
                .userId(event.getUserId())
                .orderId(event.getOrderId().toString())
                .productIdentifiers(order.getItems().stream()
                        .map((OrderItem item) -> new CartItemIdentifier(item.getProductId(), normalizeColor(item.getColor())))
                        .collect(Collectors.toList()))
                .reason(event.getFailureReason())
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
            
            // Store the current status to determine if we need to cancel inventory
            Order.OrderStatus currentStatus = order.getStatus();
            
            // Check if order is not already in FAILED status to prevent duplicate processing
            if (!currentStatus.equals(Order.OrderStatus.FAILED)) {
                order.setStatus(Order.OrderStatus.FAILED);
                orderRepository.save(order);
                log.info("Order updated to FAILED for orderId: {}", order.getId());

                // Only send CancelInventoryReservationRequest if order was in states where inventory was reserved
                if (currentStatus == Order.OrderStatus.PAYMENT_PENDING ||
                    currentStatus == Order.OrderStatus.PAYMENT_FAILED ||
                    currentStatus == Order.OrderStatus.RESERVING) {
                    
                    CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                            .transactionId(event.getTransactionId())
                            .orderId(event.getOrderId())
                            .build();
                    orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);
                    log.info("CancelInventoryReservationRequest sent for orderId: {} with previous status: {}", 
                            event.getOrderId(), currentStatus);
                }
            } else {
                log.info("Order {} is already in FAILED status, skipping cancel inventory request", event.getOrderId());
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

    // Method to get order with items for admin operations that need items data
    @Transactional(readOnly = true)
    public Order getOrderByIdWithItems(Long orderId) {
        return orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    @Override
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = getOrderByIdWithItems(orderId); // Use WithItems version since we access order.getItems()
        
        // Check if we can cancel this order
        if (order.getStatus() == Order.OrderStatus.FAILED || 
            order.getStatus() == Order.OrderStatus.PAYMENT_FAILED) {
            log.info("Order {} is already in {} status. No action needed.", orderId, order.getStatus());
            return;
        }
        
        if (order.getStatus() == Order.OrderStatus.RESERVING || 
            order.getStatus() == Order.OrderStatus.PAYMENT_PENDING) {
            
            // Store previous status for logging
            Order.OrderStatus previousStatus = order.getStatus();
            
            // Update order status
            order.setStatus(Order.OrderStatus.FAILED);
            orderRepository.save(order);
            log.info("Order status updated from {} to FAILED for orderId: {}", previousStatus, orderId);

            // Generate a transaction ID for this cancellation
            String transactionId = UUID.randomUUID().toString();
            
            // Send cancel inventory request
            CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                    .transactionId(transactionId)
                    .orderId(orderId.toString())
                    .build();
            orderEventProducer.sendCancelInventoryReservationRequest(cancelRequest);
            log.info("CancelInventoryReservationRequest sent for orderId: {}", orderId);

            // Send checkout failed event
            CheckoutFailedEvent failedEvent = CheckoutFailedEvent.builder()
                    .transactionId(transactionId)
                    .userId(order.getUserId())
                    .orderId(orderId.toString())
                    .productIdentifiers(order.getItems().stream()
                            .map((OrderItem item) -> new CartItemIdentifier(item.getProductId(), item.getColor()))
                            .collect(Collectors.toList()))
                    .reason("Order cancelled by user")
                    .build();
            orderEventProducer.sendCheckoutFailedEvent(failedEvent);
            log.info("CheckoutFailedEvent sent for orderId: {}", orderId);
        } else {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }
    }

    @Override
    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = getOrderByIdWithItems(orderId); // Use WithItems version since we access order.getItems()
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
        Order order = getOrderByIdWithItems(orderId); // Use WithItems version since we access order.getItems()
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

    @Override
    @Transactional(readOnly = true)
    public Order getOrderByTransactionId(String transactionId) {
        log.info("Fetching order by transactionId: {}", transactionId);
        return orderRepository.findByTransactionIdWithItems(transactionId)
            .orElseThrow(() -> {
                log.warn("Order not found for transactionId: {}", transactionId);
                // Consider creating a specific OrderNotFoundByTransactionIdException
                return new RuntimeException("Order not found with transaction ID: " + transactionId);
            });
    }

    // New admin methods implementation
    @Override
    @Transactional(readOnly = true)
    public Page<Order> getAllOrdersForAdmin(Pageable pageable, String status, String userId, String transactionId) {
        log.info("Fetching orders for admin with filters - status: {}, userId: {}, transactionId: {}", 
                status, userId, transactionId);
        
        if (status != null && userId != null && transactionId != null) {
            return orderRepository.findByStatusAndUserIdAndTransactionIdContainingWithItems(
                Order.OrderStatus.valueOf(status), userId, transactionId, pageable);
        } else if (status != null && userId != null) {
            return orderRepository.findByStatusAndUserIdWithItems(Order.OrderStatus.valueOf(status), userId, pageable);
        } else if (status != null && transactionId != null) {
            return orderRepository.findByStatusAndTransactionIdContainingWithItems(
                Order.OrderStatus.valueOf(status), transactionId, pageable);
        } else if (userId != null && transactionId != null) {
            return orderRepository.findByUserIdAndTransactionIdContainingWithItems(userId, transactionId, pageable);
        } else if (status != null) {
            return orderRepository.findByStatusWithItems(Order.OrderStatus.valueOf(status), pageable);
        } else if (userId != null) {
            return orderRepository.findByUserIdWithItems(userId, pageable);
        } else if (transactionId != null) {
            return orderRepository.findByTransactionIdContainingWithItems(transactionId, pageable);
        } else {
            return orderRepository.findAllWithItems(pageable);
        }
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        log.info("Admin updating order {} status to {}", orderId, status);
        
        Order order = getOrderById(orderId);
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);
        Order.OrderStatus currentStatus = order.getStatus();
        
        // Validate status transition
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
        
        order.setStatus(newStatus);
        orderRepository.save(order);
        
        log.info("Order {} status updated from {} to {}", orderId, currentStatus, newStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrderStatistics() {
        log.info("Fetching order statistics for admin dashboard");
        
        Map<String, Object> statistics = new HashMap<>();
        
        // Total orders count
        long totalOrders = orderRepository.count();
        statistics.put("totalOrders", totalOrders);
        
        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            long count = orderRepository.countByStatus(status);
            ordersByStatus.put(status.name(), count);
        }
        statistics.put("ordersByStatus", ordersByStatus);
        
        // Recent orders (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentOrders = orderRepository.countByCreatedAtAfter(thirtyDaysAgo);
        statistics.put("recentOrders", recentOrders);
        
        // Total revenue from completed orders
        Integer totalRevenue = orderRepository.sumTotalAmountByStatus(Order.OrderStatus.PAYMENT_COMPLETED);
        statistics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0);
        
        // Revenue this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        Integer monthlyRevenue = orderRepository.sumTotalAmountByStatusAndCreatedAtAfter(
                Order.OrderStatus.PAYMENT_COMPLETED, startOfMonth);
        statistics.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : 0);
        
        log.info("Order statistics calculated successfully");
        return statistics;
    }

    private boolean isValidStatusTransition(Order.OrderStatus current, Order.OrderStatus target) {
        // Define valid status transitions
        switch (current) {
            case CREATED:
                return target == Order.OrderStatus.RESERVING || target == Order.OrderStatus.CANCELLED;
            case RESERVING:
                return target == Order.OrderStatus.PAYMENT_PENDING || 
                       target == Order.OrderStatus.FAILED || 
                       target == Order.OrderStatus.CANCELLED;
            case PAYMENT_PENDING:
                return target == Order.OrderStatus.PAYMENT_COMPLETED || 
                       target == Order.OrderStatus.PAYMENT_FAILED ||
                       target == Order.OrderStatus.CANCELLED;
            case PAYMENT_COMPLETED:
                return target == Order.OrderStatus.PROCESSING;
            case PROCESSING:
                return target == Order.OrderStatus.SHIPPED;
            case SHIPPED:
                return target == Order.OrderStatus.DELIVERED;
            case DELIVERED:
                return false; // Final state
            case FAILED:
            case PAYMENT_FAILED:
            case CANCELLED:
                return false; // Final states
            default:
                return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkIfUserPurchasedProduct(String userId, String productId) {
        log.info("Checking if user {} has purchased product {}", userId, productId);
        
        // Kiểm tra xem user có đơn hàng nào chứa sản phẩm này với trạng thái PAYMENT_COMPLETED không
        List<Order> deliveredOrders = orderRepository.findByUserIdAndStatusWithItems(userId, Order.OrderStatus.PAYMENT_COMPLETED);
        
        boolean hasPurchased = deliveredOrders.stream()
                .flatMap(order -> order.getItems().stream())
                .anyMatch(item -> item.getProductId().equals(productId));
        
        log.info("User {} {} purchased product {}", 
                userId, hasPurchased ? "has" : "has not", productId);
        return hasPurchased;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserPurchaseHistoryResponseDto> getUserPurchaseHistory(String userId, Pageable pageable, String status) {
        log.info("Fetching purchase history for user: {} with status filter: {}", userId, status);
        
        Page<Order> orders;
        if (status != null && !status.trim().isEmpty()) {
            // Filter by status if provided
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orders = orderRepository.findByUserIdAndStatusWithItems(userId, orderStatus, pageable);
        } else {
            // Get all orders for user
            orders = orderRepository.findByUserIdWithItems(userId, pageable);
        }
        
        // Convert to DTO
        return orders.map(this::convertToUserPurchaseHistoryDto);
    }
    
    private UserPurchaseHistoryResponseDto convertToUserPurchaseHistoryDto(Order order) {
        // Convert order items to CartItemResponse
        List<CartItemResponse> itemDtos = order.getItems().stream()
                .map(item -> new CartItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity(),
                        item.getColor(),
                        true // Assume available since it was purchased
                ))
                .collect(Collectors.toList());
        
        // Create DTO
        UserPurchaseHistoryResponseDto dto = new UserPurchaseHistoryResponseDto(
                order.getId().toString(),
                order.getTransactionId(),
                order.getTotalAmount(),
                order.getStatus() != null ? order.getStatus().name() : null,
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getShippingAddress(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
        
        // Set items
        dto.setItems(itemDtos);
        
        return dto;
    }
    
    // Helper để chuẩn hóa color thành "default" khi null hoặc rỗng (duplicate method for review check)
    private String normalizeColor(String color) {
        return (color == null || color.trim().isEmpty()) ? "default" : color.trim();
    }
}