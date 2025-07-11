package com.eazybytes.service;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.Objects;

@Data
public class CartItemIdentifier {
    private String productId;
    private String color;

    // Default constructor for Jackson
    public CartItemIdentifier() {
    }

    // Constructor for JSON deserialization
    @JsonCreator
    public CartItemIdentifier(
            @JsonProperty("productId") String productId,
            @JsonProperty("color") String color) {
        this.productId = productId;
        this.color = color;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CartItemIdentifier that = (CartItemIdentifier) o;
        
        // If either item has null color, compare only by productId
        if (this.color == null || that.color == null) {
            return Objects.equals(productId, that.productId);
        }
        
        // Otherwise compare both productId and color
        return Objects.equals(productId, that.productId) && 
               Objects.equals(color, that.color);
    }
    
    @Override
    public int hashCode() {
        // If color is null, hash based only on productId
        if (color == null) {
            return Objects.hash(productId);
        }
        // Otherwise hash based on both fields
        return Objects.hash(productId, color);
    }
}