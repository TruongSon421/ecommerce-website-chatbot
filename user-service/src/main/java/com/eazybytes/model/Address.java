package com.eazybytes.model;

import com.eazybytes.converter.AddressTypeConverter;
import jakarta.validation.constraints.*;
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

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    @Size(min = 2, max = 100, message = "Tỉnh/Thành phố phải có độ dài từ 2-100 ký tự")
    private String province; // Tỉnh/Thành phố, e.g., "Hà Nội"

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(min = 2, max = 100, message = "Quận/Huyện phải có độ dài từ 2-100 ký tự")
    private String district; // Quận/Huyện, e.g., "Quận 1"

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Phường/Xã không được để trống")
    @Size(min = 2, max = 100, message = "Phường/Xã phải có độ dài từ 2-100 ký tự")
    private String ward; // Phường/Xã, e.g., "Phường Bến Nghé"

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(min = 5, max = 255, message = "Địa chỉ chi tiết phải có độ dài từ 5-255 ký tự")
    private String street; // Đường/Địa chỉ chi tiết, e.g., "123 Lê Lợi"

    @Builder.Default
    @Column(nullable = false)
    @NotNull(message = "Trạng thái mặc định không được null")
    private Boolean isDefault = false;

    // Use the custom converter instead of @Enumerated
    @Convert(converter = AddressTypeConverter.class)
    @Column(name = "address_type", length = 20)
    @NotNull(message = "Loại địa chỉ không được để trống")
    @Builder.Default
    private AddressType addressType = AddressType.NHA_RIENG;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(min = 2, max = 100, message = "Tên người nhận phải có độ dài từ 2-100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Tên người nhận chỉ được chứa chữ cái và khoảng trắng")
    private String receiverName;

    @Column(nullable = false)
    @NotNull(message = "Số điện thoại người nhận không được để trống")
    @Min(value = 1000000000L, message = "Số điện thoại phải có ít nhất 10 chữ số")
    @Max(value = 99999999999999L, message = "Số điện thoại không được vượt quá 14 chữ số")
    private Long receiverPhone;

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