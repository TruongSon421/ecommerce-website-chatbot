package com.eazybytes.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InitiateVNPayPaymentRequestDto {
    private Long amount; // Amount in VND (e.g., 100000.00 for 100,000 VND)
    private String orderInfo; // Description of the order
    private String orderId; // Your internal unique order identifier
    private String transactionId; // Unique transaction ID (will be used as vnp_TxnRef)
    private String bankCode; // Optional: VNBANK, INTCARD, VNPAYQR etc.
} 