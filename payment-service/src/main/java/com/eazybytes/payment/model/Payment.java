package com.eazybytes.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments", uniqueConstraints = {
        // Cân nhắc thêm UNIQUE constraint nếu logic nghiệp vụ yêu cầu
        // @UniqueConstraint(columnNames = {"orderId"}),
        // @UniqueConstraint(columnNames = {"transactionId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID orderId;

    // Thêm transactionId để dễ truy vết và kiểm tra tính ổn định (idempotency)
    @Column(nullable = false)
    private String transactionId;

    // ID do hệ thống thanh toán (hoặc service này) tạo ra
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

    private String failureReason; // Thêm lý do thất bại nếu cần

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Version // Thêm optimistic locking
    private Long version;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.paymentId == null) {
            this.paymentId = UUID.randomUUID().toString(); // Tự tạo nếu chưa có
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING, // Trạng thái chờ xử lý
        SUCCESS,
        FAILED
    }

    // Enum này nên khớp với Enum trong OrderService
    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        QR_CODE,
        TRANSFER_BANKING // Đổi tên từ BANK_TRANSFER để khớp OrderService
    }
}