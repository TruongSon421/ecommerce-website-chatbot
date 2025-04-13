// com.eazybytes.cart.dto.CheckoutRequest
package com.eazybytes.cart.dto;


import lombok.Data;

@Data
public class CheckoutRequest {
    private String userId;
    private String shippingAddress;
    private String paymentMethod;
    
}

