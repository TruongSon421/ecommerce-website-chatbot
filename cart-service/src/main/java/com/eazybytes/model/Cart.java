package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable; // Nên thêm Serializable khi làm việc với cache/serialization
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "carts")
@Getter
@Setter

public class Cart implements Serializable { // Implement Serializable

    private static final long serialVersionUID = 1L; // Thêm serialVersionUID cho Serializable

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private String userId;

    // FetchType.EAGER có thể gây vấn đề hiệu năng nếu list items lớn, cân nhắc LAZY
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<CartItems> items = new ArrayList<>();

    @Column(name = "total_price")
    private Integer totalPrice; // Thêm trường này để lưu tổng giá trị của giỏ hàng

    // --- Thêm trường Optimistic Locking ---
    @Version
    @Column(name = "version")
    private Long version; // JPA sẽ tự động quản lý trường này
   
    @Column(name = "transaction_id")
    private String transactionId; // Theo dõi Saga

    // Các phương thức addItem, removeItem, clearItems giữ nguyên như cũ
    public void addItem(CartItems item) {
        for (CartItems existingItem : items) {
            if (Objects.equals(existingItem.getProductId(), item.getProductId())) {
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                item.setCart(this); // Đảm bảo mối quan hệ được thiết lập
                return;
            }
        }
        items.add(item);
        item.setCart(this); // Đảm bảo mối quan hệ được thiết lập
    }

    public void removeItem(String productId) {
        items.removeIf(item -> Objects.equals(item.getProductId(), productId));
    }

    public void clearItems() {
        items.clear();
    }

    
}