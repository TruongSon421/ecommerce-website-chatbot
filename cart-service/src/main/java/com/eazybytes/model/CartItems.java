package com.eazybytes.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Data
@Table(name = "cart_items")
@NoArgsConstructor
@AllArgsConstructor
public class CartItems implements Serializable {
    private static final long serialVersionUID = 1L;
    
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
    @JsonBackReference 
    private Cart cart;
}