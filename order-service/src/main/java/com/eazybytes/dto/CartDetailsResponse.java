package com.eazybytes.dto;

import java.util.List;

public class CartDetailsResponse {
    private String userId;
    private List<CartItem> items; // Thay đổi để chứa đầy đủ thông tin
    private String totalPrice;    // String thay vì BigDecimal

    public CartDetailsResponse(String userId, List<CartItem> items, String totalPrice) {
        this.userId = userId;
        this.items = items;
        this.totalPrice = totalPrice;
    }

    public String getUserId() { return userId; }
    public List<CartItem> getItems() { return items; }
    public String getTotalPrice() { return totalPrice; }

    // Lớp CartItem bên trong để khớp với dữ liệu từ cart-service
    public static class CartItem {
        private String productId;
        private String color;
        private String productName;
        private Integer quantity;
        private String price; // String thay vì BigDecimal

        public CartItem(String productId, String color, String productName, Integer quantity, String price) {
            this.productId = productId;
            this.color = color;
            this.productName = productName;
            this.quantity = quantity;
            this.price = price;
        }

        public String getProductId() { return productId; }
        public String getColor() { return color; }
        public String getProductName() { return productName; }
        public Integer getQuantity() { return quantity; }
        public String getPrice() { return price; }
    }
}