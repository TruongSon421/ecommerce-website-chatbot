    package com.eazybytes.model;

    import jakarta.persistence.*;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;
    import org.hibernate.annotations.CreationTimestamp;
    import org.hibernate.annotations.UpdateTimestamp;

    import java.time.LocalDateTime;
    import java.util.List;

    @Entity
    @Table(name = "group_product_junction")
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public class GroupProduct {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "group_product_id")
        private Integer groupProductId;

        @Column(name = "group_id")
        private Integer groupId;

        @Column(name = "product_id", nullable = false)
        private String productId;

        @Column(name = "order_number", nullable = true)
        private Integer orderNumber;

        @Column(name = "variant", nullable = true)
        private String variant;

        @Column(name = "productName", nullable = true)
        private String productName;

        @Column(name = "default_original_price",nullable = true)
        private String defaultOriginalPrice;

        @Column(name = "default_current_price",nullable = true)
        private String defaultCurrentPrice;

        @CreationTimestamp
        @Column(name = "created_at")
        private LocalDateTime createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;
    }