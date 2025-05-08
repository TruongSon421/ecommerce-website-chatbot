package com.eazybytes.service;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

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
}