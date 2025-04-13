package com.eazybytes.cart.dto;

import lombok.Data;
import java.util.List;

import com.eazybytes.cart.service.CartItemIdentifier;

@Data
public class CheckoutRequestWrapper {
    private CheckoutRequest checkoutRequest;
    private List<CartItemIdentifier> selectedItems;
}