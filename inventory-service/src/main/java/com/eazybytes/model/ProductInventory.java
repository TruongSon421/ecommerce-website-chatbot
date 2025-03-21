package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_inventory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Integer inventoryId;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "product_name", nullable = true)
    private String productName;

    @Column(name = "color", nullable = true)
    private String color;

    @Column(name = "quantity", nullable = true)
    private Integer quantity;

    @Column(name = "original_price", nullable = true)
    private String originalPrice;

    @Column(name = "current_price", nullable = true)
    private String currentPrice;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}