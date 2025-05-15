package com.eazybytes.config;

import com.eazybytes.model.Cart;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

public abstract class CartItemsMixin {
    @JsonProperty("cart")
    @JsonBackReference
    abstract Cart getCart();
} 