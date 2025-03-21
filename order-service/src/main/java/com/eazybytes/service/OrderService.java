package com.eazybytes.service;

import com.eazybytes.dto.*;
import com.eazybytes.exception.OrderNotFoundException;
import com.eazybytes.exception.ProductOutOfStockException;
import com.eazybytes.model.Order;
import com.eazybytes.model.OrderItem;
import com.eazybytes.model.OrderStatus;
import com.eazybytes.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    /**
     * Tạo đơn hàng mới
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        // Kiểm tra tồn kho
        for (OrderItemRequest item : orderRequest.getItems()) {
            boolean inStock = checkInventory(item);
            if (!inStock) {
                throw new ProductOutOfStockException("Sản phẩm " + item.getProductName() +
                        " (" + item.getColor() + ") không đủ số lượng trong kho");
            }
        }

        // Tạo mã đơn hàng unique
        String orderNumber = generateOrderNumber();

        // Tính tổng tiền
        BigDecimal totalPrice = calculateTotalPrice(orderRequest.getItems(), orderRequest.getShippingFee());

        // Tạo đơn hàng
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(orderRequest.getUserId())
                .totalPrice(totalPrice)
                .shippingAddress(orderRequest.getShippingAddress())
                .phoneNumber(orderRequest.getPhoneNumber())
                .email(orderRequest.getEmail())
                .status(OrderStatus.PENDING)
                .paymentMethod(orderRequest.getPaymentMethod())
                .paymentStatus("PENDING")
                .shippingFee(orderRequest.getShippingFee())
                .notes(orderRequest.getNotes())
                .build();

        // Thêm các item vào đơn hàng
        for (OrderItemRequest itemRequest : orderRequest.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productType(itemRequest.getProductType())
                    .productName(itemRequest.getProductName())
                    .color(itemRequest.getColor())
                    .storage(itemRequest.getStorage())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .subtotal(itemRequest.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())))
                    .build();

            order.addItem(orderItem);
        }

        // Lưu đơn hàng
        Order savedOrder = orderRepository.save(order);

        // Cập nhật số lượng tồn kho
        updateInventory(orderRequest.getItems());

        return mapToOrderResponse(savedOrder);
    }

    /**
     * Lấy thông tin chi tiết đơn hàng
     */
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng với mã: " + orderNumber));

        return mapToOrderResponse(order);
    }

    /**
     * Lấy danh sách đơn hàng của một người dùng
     */
    public List<OrderResponse> getOrdersByUserId(String userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách đơn hàng của một người dùng (có phân trang)
     */
    public Page<OrderResponse> getOrdersByUserId(String userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);

        return orders.map(this::mapToOrderResponse);
    }

    /**
     * Lấy danh sách đơn hàng theo trạng thái
     */
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);

        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách đơn hàng theo trạng thái (có phân trang)
     */
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByStatus(status, pageable);

        return orders.map(this::mapToOrderResponse);
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public OrderResponse updateOrderStatus(OrderStatusUpdateRequest request) {
        Order order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng với mã: " + request.getOrderNumber()));

        order.setStatus(request.getStatus());

        // Nếu đơn hàng bị hủy, cần cập nhật lại số lượng tồn kho
        if (request.getStatus() == OrderStatus.CANCELLED &&
                (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.RETURNED)) {
            // Trả lại số lượng cho kho
            returnInventory(order.getItems());
        }

        Order updatedOrder = orderRepository.save(order);

        return mapToOrderResponse(updatedOrder);
    }

    /**
     * Hủy đơn hàng
     */
    @Transactional
    public OrderResponse cancelOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Không tìm thấy đơn hàng với mã: " + orderNumber));

        // Chỉ có thể hủy đơn hàng ở trạng thái PENDING hoặc CONFIRMED
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Không thể hủy đơn hàng ở trạng thái: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Trả lại số lượng cho kho
        returnInventory(order.getItems());

        Order cancelledOrder = orderRepository.save(order);

        return mapToOrderResponse(cancelledOrder);
    }

    // Các phương thức hỗ trợ

    /**
     * Tạo mã đơn hàng duy nhất
     */
    private String generateOrderNumber() {
        // Format: ORD-[năm][tháng][ngày]-[UUID ngắn]
        LocalDateTime now = LocalDateTime.now();
        String datePart = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniquePart = UUID.randomUUID().toString().substring(0, 8);

        return "ORD-" + datePart + "-" + uniquePart;
    }

    /**
     * Tính tổng tiền đơn hàng
     */
    private BigDecimal calculateTotalPrice(List<OrderItemRequest> items, BigDecimal shippingFee) {
        BigDecimal itemsTotal = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Cộng phí vận chuyển nếu có
        if (shippingFee != null) {
            return itemsTotal.add(shippingFee);
        }

        return itemsTotal;
    }

    /**
     * Kiểm tra tồn kho cho sản phẩm
     */
    private boolean checkInventory(OrderItemRequest item) {
        if ("PHONE".equals(item.getProductType())) {
            return inventoryService.isPhoneAvailable(item.getProductId(), item.getColor(), item.getQuantity());
        } else if ("LAPTOP".equals(item.getProductType())) {
            return inventoryService.isLaptopAvailable(item.getProductId(), item.getColor(), item.getQuantity());
        }

        return false;
    }

    /**
     * Cập nhật số lượng tồn kho sau khi đặt hàng
     */
    private void updateInventory(List<OrderItemRequest> items) {
        for (OrderItemRequest item : items) {
            if ("PHONE".equals(item.getProductType())) {
                inventoryService.decreasePhoneQuantity(item.getProductId(), item.getColor(), item.getQuantity());
            } else if ("LAPTOP".equals(item.getProductType())) {
                inventoryService.decreaseLaptopQuantity(item.getProductId(), item.getColor(), item.getQuantity());
            }
        }
    }

    /**
     * Trả lại số lượng tồn kho khi hủy đơn hàng
     */
    private void returnInventory(List<OrderItem> items) {
        for (OrderItem item : items) {
            if ("PHONE".equals(item.getProductType())) {
                inventoryService.increasePhoneQuantity(item.getProductId(), item.getColor(), item.getQuantity());
            } else if ("LAPTOP".equals(item.getProductType())) {
                inventoryService.increaseLaptopQuantity(item.getProductId(), item.getColor(), item.getQuantity());
            }
        }
    }

    /**
     * Chuyển đổi từ Entity sang DTO
     */
    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productType(item.getProductType())
                        .productName(item.getProductName())
                        .color(item.getColor())
                        .storage(item.getStorage())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .totalPrice(order.getTotalPrice())
                .shippingAddress(order.getShippingAddress())
                .phoneNumber(order.getPhoneNumber())
                .email(order.getEmail())
                .status(order.getStatus().getDisplayValue())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingFee(order.getShippingFee())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt().toString())
                .updatedAt(order.getUpdatedAt().toString())
                .items(itemResponses)
                .build();
    }
}

// Inventory Service Interface (Kết nối với Inventory Service)
