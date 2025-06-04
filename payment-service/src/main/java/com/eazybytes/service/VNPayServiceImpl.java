package com.eazybytes.service;

import com.eazybytes.config.VnpayConfig;
import com.eazybytes.dto.ConfirmVNPayPaymentResponseDto;
import com.eazybytes.dto.InitiateVNPayPaymentRequestDto;
import com.eazybytes.model.Payment; // Assuming you have a Payment entity
import com.eazybytes.repository.PaymentRepository; // And its repository
import com.eazybytes.vnpay.common.utils.VnPayHelper; // Your VNPay utility class

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {

    private final VnpayConfig vnPayConfig;
    private final PaymentRepository paymentRepository; // Autowire your PaymentRepository

    @Override
    public String createPaymentUrl(InitiateVNPayPaymentRequestDto requestDto, String clientIpAddress) {
        log.info("Creating VNPay payment URL for transactionId: {}, amount: {}, clientIp: {}", 
                 requestDto.getTransactionId(), requestDto.getAmount(), clientIpAddress);

        // Validate amount to ensure it's reasonable
        Long amount = requestDto.getAmount();
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Invalid amount: " + amount);
        }
        
        // Check if amount seems too large (possibly already multiplied by 100 twice)
        // A simple heuristic: if amount > 1 billion VND, it might be an error
        if (amount > 1000000000) { // 1 billion VND
            log.warn("Amount seems unusually large: {}. Please verify it's correct.", amount);
        }

        String vnp_Version = vnPayConfig.getVersion();
        String vnp_Command = vnPayConfig.getCommandPay();
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        
        // VNPay expects amount in VND without decimal points (smallest currency unit)
        String vnp_Amount = String.valueOf(amount);
        log.info("Final amount sent to VNPay: {} VND", vnp_Amount);
        String vnp_CurrCode = "VND";
        String bank_code = requestDto.getBankCode();
            
        String vnp_TxnRef = requestDto.getTransactionId();
        String vnp_OrderInfo = requestDto.getOrderInfo();
        String vnp_OrderType = vnPayConfig.getOrderTypeOther();
        String vnp_Locale = "vn";
        // IMPORTANT: This is the URL VNPay will redirect the user's browser to after payment.
        String vnp_ReturnUrl = vnPayConfig.getVnpReturnUrl(); // Use configured return URL instead of constructing it
        String vnp_IpAddr = clientIpAddress; // Use the passed client IP address

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        vnp_Params.put("vnp_BankCode", bank_code);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 10); 
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayHelper.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentFullUrl = vnPayConfig.getVnpPayUrl() + "?" + queryUrl;
        log.debug("Built VNPay URL: {}", paymentFullUrl);

        return paymentFullUrl;
    }

    @Override
    public ConfirmVNPayPaymentResponseDto handleVNPayReturn(HttpServletRequest request) {
        Map<String, String> vnpayParams = Collections.list(request.getParameterNames())
            .stream()
            .collect(Collectors.toMap(paramName -> paramName, request::getParameter));
        
        log.info("Handling VNPay return with params: {}", vnpayParams);

        String vnp_ResponseCode = vnpayParams.get("vnp_ResponseCode");
        String vnp_TxnRef = vnpayParams.get("vnp_TxnRef");
        String vnp_TransactionNo = vnpayParams.get("vnp_TransactionNo");
        String vnp_OrderInfo = vnpayParams.get("vnp_OrderInfo");
        String vnp_Amount = vnpayParams.get("vnp_Amount");

        log.info("VNPay Return Validated: TxnRef={}, ResponseCode={}, VNPayTxnNo={}, OrderInfo={}, Amount={}", 
            vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo, vnp_OrderInfo, vnp_Amount);

        // Extract orderId from transaction reference or find payment to get orderId FIRST
        // This ensures the ConfirmVNPayPaymentResponseDto has a proper orderId even if signature fails
        // Trích xuất orderId từ vnp_OrderInfo
        String orderId = null;
        if (vnp_OrderInfo != null && !vnp_OrderInfo.isEmpty()) {
            String[] parts = vnp_OrderInfo.split(" ");
            if (parts.length > 0) {
                orderId = parts[parts.length - 1];
                log.info("Extracted orderId from vnp_OrderInfo: {}", orderId);
            }
        }
        
        // Nếu không lấy được từ vnp_OrderInfo, thử lấy từ database
        if (orderId == null) {
            try {
                // Try to find the payment record to get the orderId
                Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(vnp_TxnRef);
                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    orderId = String.valueOf(payment.getOrderId());
                    log.info("Retrieved orderId from database: {}", orderId);
                    
                    // Verify amount if available
                    if (vnp_Amount != null) {
                        try {
                            // Parse the VNPay amount (already in smallest unit)
                            Long vnpayAmount = Long.parseLong(vnp_Amount);
                            
                            // Get the original amount stored in our database
                            Double storedAmount = Double.valueOf(payment.getAmount());
                            
                            // Convert our stored amount to the smallest unit (multiply by 100)
                            Long expectedAmount = (long)(storedAmount * 100);
                            
                            log.info("Amount verification - VNPay sent: {}, Original stored: {}, Expected after *100: {}", 
                                    vnpayAmount, storedAmount, expectedAmount);
                            
                            if (!vnpayAmount.equals(expectedAmount)) {
                                log.warn("Amount mismatch for transactionId: {}. Expected: {}, Received: {}. This might be due to currency conversion or formatting.", 
                                        vnp_TxnRef, expectedAmount, vnpayAmount);
                            }
                        } catch (NumberFormatException e) {
                            log.error("Error parsing amount values: {}", e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not retrieve orderId from payment record: {}", e.getMessage());
            }
        }
        
        // Fall back to using TxnRef as orderId if not found from other sources
        if (orderId == null) {
            orderId = vnp_TxnRef;
            log.info("Using vnp_TxnRef as orderId fallback: {}", orderId);
        }

        // Now perform signature verification
        String vnp_SecureHash = vnpayParams.get("vnp_SecureHash");
        Map<String, String> paramsWithoutHash = new HashMap<>(vnpayParams);
        paramsWithoutHash.remove("vnp_SecureHash");
        paramsWithoutHash.remove("vnp_SecureHashType");

        if (vnp_SecureHash == null) {
            log.warn("VNPay return is missing vnp_SecureHash. TxnRef: {}", vnp_TxnRef);
            return new ConfirmVNPayPaymentResponseDto(false, orderId, "Missing secure hash from VNPay.", "ERROR");
        }
        
        boolean isValidSignature = verifySignature(paramsWithoutHash, vnp_SecureHash);

        if (!isValidSignature) {
            log.warn("Return URL signature is invalid for TxnRef: {}", vnp_TxnRef);
            return new ConfirmVNPayPaymentResponseDto(false, orderId, "Invalid signature from VNPay.", "ERROR");
        }

        // Simply validate and return the result, let PaymentServiceImpl handle database operations
        if ("00".equals(vnp_ResponseCode)) {
            return new ConfirmVNPayPaymentResponseDto(true, orderId, "Payment successfully processed", "SUCCESS");
        } else {
            return new ConfirmVNPayPaymentResponseDto(false, orderId, 
                "Payment processing encountered an issue. Code: " + vnp_ResponseCode, "FAILED");
        }
    }
    
    @Override
    public boolean verifySignature(Map<String, String> vnpayParams, String vnp_SecureHash) {
        
        if (vnp_SecureHash == null) {
            log.warn("vnp_SecureHash is null, returning false");
            return false;
        }
        
        // Copy the params to avoid modifying the original
        Map<String, String> params = new HashMap<>(vnpayParams);
        // Remove these fields if they exist (they shouldn't be in hash calculation)
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        
        // Re-create hash data for comparison
        String calculatedSecureHash = VnPayHelper.hashAllFields(params, vnPayConfig.getHashSecret());
        
        boolean result = calculatedSecureHash.equals(vnp_SecureHash);
        
        return result;
    }
    
    @Override
    public boolean verifySignature(Map<String, String> vnpayParams) {
        // Backward compatibility - extract vnp_SecureHash from params
        String vnp_SecureHash = vnpayParams.get("vnp_SecureHash");
        Map<String, String> paramsWithoutHash = new HashMap<>(vnpayParams);
        paramsWithoutHash.remove("vnp_SecureHash");
        paramsWithoutHash.remove("vnp_SecureHashType");
        
        return verifySignature(paramsWithoutHash, vnp_SecureHash);
    }
}