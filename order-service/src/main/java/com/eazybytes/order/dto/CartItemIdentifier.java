package com.eazybytes.order.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class CartItemIdentifier {
    private String productId;
    private String color;

    public CartItemIdentifier(String productId, String color) {
        this.productId = productId;
        this.color = color;
    }

    public String getProductId() { return productId; }
    public String getColor() { return color; }
}