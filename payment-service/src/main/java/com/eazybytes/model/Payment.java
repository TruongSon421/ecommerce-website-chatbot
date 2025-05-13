package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments", uniqueConstraints = {
        // Cân nhắc thêm UNIQUE constraint nếu logic nghiệp vụ yêu cầu
        @UniqueConstraint(columnNames = {"orderId"}),
        @UniqueConstraint(columnNames = {"transactionId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String transactionId;

    @Column(nullable = false, unique = true)
    private String paymentId;

    @Column(nullable = false)
    private String amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    private String failureReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paymentId == null) {
            this.paymentId = UUID.randomUUID().toString();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED
    }

    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        QR_CODE,
        TRANSFER_BANKING
    }
}