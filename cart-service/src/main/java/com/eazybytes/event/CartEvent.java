package com.eazybytes.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import com.eazybytes.service.CartItemIdentifier;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartEvent implements Serializable {
    private String eventType;         // Loại sự kiện (ví dụ: ORDER_CONFIRMED)
    private String userId;            // ID của người dùng
    private List<CartItemIdentifier> productIdentifiers;  // Danh sách ID sản phẩm liên quan đến sự kiện
    private LocalDateTime timestamp;  // Thời gian sự kiện

    // Constructor tiện lợi cho việc tạo sự kiện
    public CartEvent(String eventType, String userId, List<CartItemIdentifier> productIdentifiers) {
        this.eventType = eventType;
        this.userId = userId;
        this.productIdentifiers = productIdentifiers;
        this.timestamp = LocalDateTime.now();
    }
}