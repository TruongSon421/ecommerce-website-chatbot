package com.eazybytes.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VnpayConfig {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl; // Renamed from url to vnpPayUrl for clarity

    // This is the URL VNPAY will use to send IPN messages to your backend
    @Value("${vnpay.ipnUrl:http://localhost:8070/api/v1/payment/vnpay/ipn}") 
    private String ipnUrl; 
    
    // This is the complete return URL that VNPay will redirect to 
    @Value("${vnpay.returnUrl:http://localhost:8070/api/v1/payment/vnpay/return}")
    private String vnpReturnUrl;

    // This is the base URL of your frontend application.
    // The actual vnp_ReturnUrl sent to VNPAY will be constructed using this base + a specific path.
    @Value("${vnpay.frontendReturnUrlBase:http://localhost:5173}") 
    private String frontendReturnUrlBase; 

    @Value("${vnpay.version:2.1.0}")
    private String version;

    // Default command for payment
    @Value("${vnpay.command:pay}")
    private String commandPay;

    // Default currency code
    public static final String VNP_CURR_CODE = "VND";
    // Default locale
    public static final String VNP_LOCALE_VN = "vn";
    // Default order type
    @Value("${vnpay.orderType:other}")
    private String orderTypeOther;

} 