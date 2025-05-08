package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Data
@Table(name = "cart_items")
@NoArgsConstructor
@AllArgsConstructor
public class CartItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;
    @Column(name = "product_name")
    private String productName;
    @Column(name = "color")
    private String color;
    @Column(name = "quantity")
    private Integer quantity;
    @Column(name = "price")
    private Integer price;
    

    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore 
    private Cart cart;
}
