package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Product name không được để trống")
    @Size(max = 200, message = "Product name phải từ 2-200 ký tự")
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Size(max = 100, message = "Color không quá 100 ký tự")
    @Column(name = "color", nullable = true, length = 100)
    private String color;

    @NotNull(message = "Quantity không được null")
    @Min(value = 0, message = "Quantity không được âm")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Min(value = 1, message = "Original price phải lớn hơn 0")
    private Integer originalPrice;

    @NotNull(message = "Current price không được null")
    @Min(value = 1, message = "Current price phải lớn hơn 0")
    @Column(name = "current_price", nullable = false)
    private Integer currentPrice;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version; // Optimistic locking
}