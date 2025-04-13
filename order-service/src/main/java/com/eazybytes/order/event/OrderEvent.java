package com.eazybytes.order.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    private String eventType;           // Loại sự kiện (ORDER_CREATED, ORDER_CONFIRMED, ORDER_CANCELLED, v.v.)
    private UUID orderId;               // ID của đơn hàng
    private String userId;              // ID của người dùng
    private List<OrderItemDetails> items; // Danh sách các mục trong đơn hàng
    private String totalAmount;         // Tổng tiền (String theo yêu cầu)
    private String status;              // Trạng thái đơn hàng
    private LocalDateTime timestamp;    // Thời gian sự kiện

    // Constructor tiện lợi
    public OrderEvent(String eventType, UUID orderId, String userId, List<OrderItemDetails> items, String totalAmount, String status) {
        this.eventType = eventType;
        this.orderId = orderId;
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    // Lớp nội bộ để biểu diễn chi tiết mục đơn hàng
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDetails {
        private String productId;
        private String color;
        private String productName;
        private Integer quantity;
        private String price; // String theo yêu cầu
    }
}