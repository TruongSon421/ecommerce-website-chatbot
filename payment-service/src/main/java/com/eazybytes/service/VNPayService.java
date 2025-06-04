package com.eazybytes.service;

import com.eazybytes.dto.InitiateVNPayPaymentRequestDto;
import com.eazybytes.dto.ConfirmVNPayPaymentResponseDto;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface VNPayService {
    String createPaymentUrl(InitiateVNPayPaymentRequestDto requestDto, String clientIpAddress);
    ConfirmVNPayPaymentResponseDto handleVNPayReturn(HttpServletRequest request);
    boolean verifySignature(Map<String, String> vnpayParams, String vnp_SecureHash);
    boolean verifySignature(Map<String, String> vnpayParams);
} 