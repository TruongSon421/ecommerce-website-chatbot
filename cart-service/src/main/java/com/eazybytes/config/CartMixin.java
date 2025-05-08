package com.eazybytes.config;

import com.eazybytes.model.CartItems;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public abstract class CartMixin {
    @JsonProperty("items")
    abstract List<CartItems> getItems();
}