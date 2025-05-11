package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "color")
    private String color;

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange; // Dương: tăng, Âm: giảm

    @Column(name = "reason", nullable = false)
    private String reason; // Ví dụ: "RESERVED", "CONFIRMED", "CANCELLED", "TIMEOUT"

    @Column(name = "order_id")
    private String orderId; // Liên kết với đơn hàng (nếu có)

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}