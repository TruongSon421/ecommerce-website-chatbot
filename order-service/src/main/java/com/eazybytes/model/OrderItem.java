package com.eazybytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String productId;

    private String color;

    private String productName;

    private Integer quantity;

    private Integer price; 

    // Constructor tiện lợi
    public OrderItem(String productId, String color, String productName, Integer quantity, Integer price) {
        this.productId = productId;
        this.color = color;
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
    }
}