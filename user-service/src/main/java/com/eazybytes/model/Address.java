package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String province; // Tỉnh/Thành phố, e.g., "Hà Nội"

    @Column(nullable = false)
    private String district; // Quận/Huyện, e.g., "Quận 1"

    @Column(nullable = false)
    private String ward; // Phường/Xã, e.g., "Phường Bến Nghé"

    @Column(nullable = false)
    private String street; // Đường/Địa chỉ chi tiết, e.g., "123 Lê Lợi"

    @Column(nullable = false)
    private Boolean isDefault;

    @Column(name = "address_type")
    private String addressType; // e.g., "HOME", "WORK", "SHIPPING", "BILLING"

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}