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
    private String province;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Quận/Huyện không được để trống")
    @Size(min = 2, max = 100, message = "Quận/Huyện phải có độ dài từ 2-100 ký tự")
    private String district;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Phường/Xã không được để trống")
    @Size(min = 2, max = 100, message = "Phường/Xã phải có độ dài từ 2-100 ký tự")
    private String ward;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(min = 5, max = 255, message = "Địa chỉ chi tiết phải có độ dài từ 5-255 ký tự")
    private String street;

    @Builder.Default
    @Column(name = "is_default", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @NotNull(message = "Trạng thái mặc định không được null")
    private Boolean isDefault = false;

    @Convert(converter = AddressTypeConverter.class)
    @Column(name = "address_type", length = 20)
    @NotNull(message = "Loại địa chỉ không được để trống")
    @Builder.Default
    private AddressType addressType = AddressType.NHA_RIENG;

    @Column(name = "receiver_name", nullable = false, length = 100)
    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(min = 2, max = 100, message = "Tên người nhận phải có độ dài từ 2-100 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Tên người nhận chỉ được chứa chữ cái và khoảng trắng")
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 15)
    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    @Pattern(regexp = "^[0-9]{10,14}$", message = "Số điện thoại phải có từ 10-14 chữ số")
    private String receiverPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
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