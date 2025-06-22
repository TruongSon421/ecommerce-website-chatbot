// src/main/java/com/eazybytes/model/User.java
package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải có độ dài từ 3-50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username chỉ được chứa chữ cái, số và dấu gạch dưới")
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Password không được để trống")
    @Size(min = 8, message = "Password phải có ít nhất 8 ký tự")
    @JsonIgnore // Không serialize password
    private String password;

    @Column(length = 50)
    @Size(max = 50, message = "Tên không được vượt quá 50 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Tên chỉ được chứa chữ cái và khoảng trắng")
    private String firstName;

    @Column(length = 50)
    @Size(max = 50, message = "Họ không được vượt quá 50 ký tự")
    @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Họ chỉ được chứa chữ cái và khoảng trắng")
    private String lastName;

    @Column(length = 15)
    @Pattern(regexp = "^[0-9]{10,14}$", message = "Số điện thoại phải có từ 10-14 chữ số")
    private String phoneNumber;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ✅ FIX 1: Thay đổi từ EAGER sang LAZY
    @ManyToMany(fetch = FetchType.LAZY) // ✅ LAZY thay vì EAGER
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    @BatchSize(size = 10) // ✅ FIX: Batch loading để tối ưu
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    // ✅ FIX 2: Thêm explicit LAZY và giảm cascade scope
    @OneToMany(mappedBy = "user", 
               fetch = FetchType.LAZY, // ✅ Explicit LAZY
               cascade = {CascadeType.PERSIST, CascadeType.MERGE}, // ✅ FIX: Chỉ PERSIST, MERGE
               orphanRemoval = true)
    @BatchSize(size = 10) // ✅ FIX: Batch loading
    @JsonIgnore // ✅ FIX: Tránh infinite loop khi serialize
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    // Helper methods để quản lý quan hệ hai chiều
    public void addAddress(Address address) {
        addresses.add(address);
        address.setUser(this);
    }

    public void removeAddress(Address address) {
        addresses.remove(address);
        address.setUser(null);
    }

    // ✅ FIX 3: Helper methods để safely access relationships
    public Set<String> getRoleNames() {
        if (roles == null || roles.isEmpty()) {
            return new HashSet<>();
        }
        return roles.stream()
                .map(role -> role.getName().toString())
                .collect(Collectors.toSet());
    }

    public String getPrimaryRoleAsString() {
        if (roles == null || roles.isEmpty()) {
            return "ROLE_USER";
        }
        
        // Find admin role first, otherwise use first role
        Role primaryRole = roles.stream()
                .filter(role -> role.getName() == ERole.ROLE_ADMIN)
                .findFirst()
                .orElse(roles.iterator().next());
                
        return primaryRole.getName().toString();
    }

    public boolean hasRole(ERole roleName) {
        if (roles == null || roles.isEmpty()) {
            return false;
        }
        return roles.stream()
                .anyMatch(role -> role.getName() == roleName);
    }

    public boolean isAdmin() {
        return hasRole(ERole.ROLE_ADMIN);
    }

    // ✅ FIX 4: Methods để check if relationships are initialized
    public boolean areRolesLoaded() {
        return org.hibernate.Hibernate.isInitialized(roles);
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}