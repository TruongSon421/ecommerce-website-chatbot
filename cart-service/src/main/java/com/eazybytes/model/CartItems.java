package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productId;
    private String productName;
    private String color;
    private Integer quantity;
    private String price;

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;
}
