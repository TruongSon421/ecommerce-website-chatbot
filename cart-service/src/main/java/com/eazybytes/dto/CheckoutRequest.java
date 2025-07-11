// com.eazybytes.cart.dto.CheckoutRequest
package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private String userId;
    private String shippingAddress;
    private String paymentMethod;
    
}

