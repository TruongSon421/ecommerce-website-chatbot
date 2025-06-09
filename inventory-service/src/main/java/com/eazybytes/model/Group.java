package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.URL;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "group_product")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Integer groupId;

    @NotNull(message = "Order number không được null")
    @Min(value = 1, message = "Order number phải lớn hơn 0")
    @Max(value = 9999, message = "Order number không được vượt quá 9999")
    @Column(name = "order_number", nullable = false, unique = true)
    private Integer orderNumber;

    @URL(message = "Image phải là URL hợp lệ")
    @Size(max = 500, message = "URL image không được vượt quá 500 ký tự")
    @Column(name = "image", nullable = true, length = 500)
    private String image;

    @NotBlank(message = "Type không được để trống")
    @Pattern(regexp = "^(phone|laptop|backup_charger|cable_charger_hub|wireless_earphone|wired_earphone|headphone)$", 
             message = "Type chỉ chấp nhận: phone|laptop|backup_charger|cable_charger_hub|wireless_earphone|wired_earphone|headphone")
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @NotBlank(message = "Brand không được để trống")
    @Size(max = 100, message = "Brand phải từ 2-100 ký tự")
    @Column(name = "brand", nullable = false, length = 100)
    private String brand;

    @NotBlank(message = "Group name không được để trống")
    @Size(max = 200, message = "Group name phải từ 3-200 ký tự")
    @Column(name = "group_name", nullable = false, length = 200)
    private String groupName;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GroupTags> groupTags;

}