package com.eazybytes.config;

import com.eazybytes.model.CartItems;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;

public abstract class CartMixin {
    @JsonProperty("items")
    @JsonManagedReference
    abstract List<CartItems> getItems();
}