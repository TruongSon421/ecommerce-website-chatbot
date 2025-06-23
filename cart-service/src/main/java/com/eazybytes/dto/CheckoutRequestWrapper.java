package com.eazybytes.dto;

import lombok.Data;
import java.util.List;

import com.eazybytes.service.CartItemIdentifier;

@Data
public class CheckoutRequestWrapper {
    private CheckoutRequest checkoutRequest;
    private List<CartItemIdentifier> selectedItems;
}