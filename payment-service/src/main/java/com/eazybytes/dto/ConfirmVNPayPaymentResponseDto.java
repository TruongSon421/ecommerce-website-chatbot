package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmVNPayPaymentResponseDto {
    private boolean success; // Whether the payment was successful
    private String orderId; // The orderId related to this payment
    private String message; // Descriptive message about payment result
    private String status; // Status code (SUCCESS, FAILED, ERROR)
} 