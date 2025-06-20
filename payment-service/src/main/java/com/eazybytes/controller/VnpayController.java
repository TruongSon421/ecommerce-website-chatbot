package com.eazybytes.controller;

import com.eazybytes.dto.ConfirmVNPayPaymentResponseDto;
import com.eazybytes.dto.InitiateVNPayPaymentRequestDto;
import com.eazybytes.service.VNPayService;
import com.eazybytes.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import com.eazybytes.config.VnpayConfig;
import com.eazybytes.vnpay.common.utils.VnPayHelper;
import com.eazybytes.model.Payment;
import java.util.*;
import java.util.logging.Logger;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/payment/vnpay")
public class VnpayController {

    private static final Logger logger = Logger.getLogger(VnpayController.class.getName());
    private final VNPayService vnpayService;
    private final PaymentService paymentService;
    private final VnpayConfig vnpayConfig;


    // Environment variables for dynamic configuration
    @Value("${NGROK_BASE_URL:https://api.truongson.shop}")
    private String ngrokBaseUrl;

    @Value("${FRONTEND_URL:https://dev.truongson.shop}")
    private String frontendUrl;

    public VnpayController(VNPayService vnpayService, PaymentService paymentService, VnpayConfig vnpayConfig) {
        this.vnpayService = vnpayService;
        this.paymentService = paymentService;
        this.vnpayConfig = vnpayConfig;
        
    }

    @PostMapping("/create-payment")
    public ResponseEntity<String> createPayment(@RequestBody InitiateVNPayPaymentRequestDto requestDto,
                                              HttpServletRequest request) {
        String clientIpAddress = VnPayHelper.getIpAddress(request);
        String paymentUrl = vnpayService.createPaymentUrl(requestDto, clientIpAddress);
        logger.info("Created payment URL for transaction: " + requestDto.getTransactionId());
        return ResponseEntity.ok(paymentUrl);
    }

    /**
     * IPN (Instant Payment Notification) endpoint
     * This is called by VNPay's server to notify your system about the payment result
     * This is the PRIMARY source of truth for payment status
     * Đây là nơi CẬP NHẬT DATABASE và xử lý logic nghiệp vụ
     * 
     * Các mã RspCode:
     * 00: Confirm Success - Ghi nhận thanh toán thành công
     * 01: Order not Found - Không tìm thấy giao dịch
     * 02: Order already confirmed - Giao dịch đã được xử lý trước đó
     * 04: Invalid Amount - Số tiền không hợp lệ
     * 97: Invalid Checksum - Sai chữ ký
     * 99: Unknown error - Lỗi không xác định
     */
    @GetMapping("/ipn")
    public ResponseEntity<String> vnpayIpn(HttpServletRequest request) {
        try {
            // Log the current ngrok URL being used
            logger.info("Processing VNPay IPN with ngrok URL: " + ngrokBaseUrl);
            
            // Get all parameters from the request
            Map<String, String> vnpParams = getVnpayParamsMap(request);
            logger.info("Received VNPay IPN: " + vnpParams);
            
            String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
            String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
            
            // 1. Kiểm tra các tham số bắt buộc
            if (vnp_TxnRef == null || vnp_SecureHash == null) {
                logger.warning("VNPay IPN missing required parameters");
                return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Missing required parameters\"}");
            }
            
            // 2. Kiểm tra checksum
            if (!vnpayService.verifySignature(vnpParams)) {
                logger.warning("VNPay IPN invalid checksum for transactionId: " + vnp_TxnRef);
                return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
            }

            // 3. Tìm giao dịch trong database (checkOrderId)
            Optional<Payment> paymentOpt;
            try {
                paymentOpt = paymentService.findPaymentByTransactionId(vnp_TxnRef);
                if (paymentOpt.isEmpty()) {
                    logger.warning("VNPay IPN order not found for transactionId: " + vnp_TxnRef);
                    return ResponseEntity.ok("{\"RspCode\":\"01\",\"Message\":\"Order not Found\"}");
                }
            } catch (Exception e) {
                logger.severe("Error finding payment: " + e.getMessage());
                return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}");
            }
            
            Payment payment = paymentOpt.get();
            
            // 4. Kiểm tra tình trạng giao dịch (checkOrderStatus)
            if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
                logger.info("VNPay IPN order already confirmed for transactionId: " + vnp_TxnRef);
                return ResponseEntity.ok("{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}");
            }
            
            // 5. Kiểm tra số tiền (checkAmount)
            String vnp_Amount = vnpParams.get("vnp_Amount");
            if (vnp_Amount != null) {
                try {
                    Long vnpayAmount = Long.parseLong(vnp_Amount);
                    Double storedAmount = Double.valueOf(payment.getAmount());
                    Long expectedAmount = (long)(storedAmount * 100);
                    
                    if (!vnpayAmount.equals(expectedAmount)) {
                        logger.warning("VNPay IPN amount mismatch for transactionId: " + vnp_TxnRef);
                        return ResponseEntity.ok("{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}");
                    }
                } catch (NumberFormatException e) {
                    logger.warning("VNPay IPN error parsing amount for transactionId: " + vnp_TxnRef);
                    return ResponseEntity.ok("{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}");
                }
            }

            // 6. Xử lý thanh toán và cập nhật database
            try {
                paymentService.handleVNPayCallback(vnpParams);
                logger.info("Successfully processed VNPay IPN for transactionId: " + vnp_TxnRef);
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            } catch (Exception e) {
                logger.severe("Error processing VNPay IPN: " + e.getMessage());
                return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}");
            }
        } catch (Exception e) {
            logger.severe("Error processing VNPay IPN: " + e.getMessage());
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}");
        }
    }

    /**
     * Return URL endpoint - this is where the user is redirected after payment
     * This is a SECONDARY confirmation mechanism, chỉ dùng cho mục đích UI/UX
     * Không cập nhật database tại đây, việc cập nhật được thực hiện thông qua IPN URL
     */
    @GetMapping("/return") 
    public RedirectView vnpayReturn(HttpServletRequest request) {
        try {
            // Log the current configuration being used
            logger.info("Processing VNPay return with ngrok URL: " + ngrokBaseUrl + ", frontend URL: " + frontendUrl);
            
            // Log all parameters received from VNPay
            Map<String, String> vnpParams = getVnpayParamsMap(request);
            logger.info("Received VNPay return URL parameters: " + vnpParams);
            
            // Log vnp_OrderInfo đặc biệt để debug
            String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");
            if (vnp_OrderInfo != null) {
                logger.info("VNPay return vnp_OrderInfo: " + vnp_OrderInfo);
                // Thử trích xuất orderId từ vnp_OrderInfo
                try {
                    String[] parts = vnp_OrderInfo.split("\\+");
                    if (parts.length > 0) {
                        String extractedOrderId = parts[parts.length - 1];
                        logger.info("Extracted orderId from vnp_OrderInfo: " + extractedOrderId);
                    }
                } catch (Exception e) {
                    logger.warning("Could not extract orderId from vnp_OrderInfo: " + e.getMessage());
                }
            }
            
            // Process return URL parameters through PaymentService
            // Lưu ý: handleVNPayReturnUrl chỉ kiểm tra toàn vẹn dữ liệu, không cập nhật database
            ConfirmVNPayPaymentResponseDto result = paymentService.handleVNPayReturnUrl(request);
            logger.info("Processed VNPay return URL result: " + result);
            
            // Build frontend redirect URL with appropriate status
            String frontendRedirectUrl = vnpayConfig.getFrontendReturnUrlBase();
            String path;
            String status;
            
            // Choose frontend path based on result
            if ("SUCCESS".equals(result.getStatus())) {
                path = "/payment-success";
                status = "success";
            } else if ("PROCESSING".equals(result.getStatus())) {
                path = "/payment-processing";
                status = "processing";
            } else {
                path = "/payment-failed";
                status = "failed";
            }
            
            // Build query parameters with proper URL encoding
            StringBuilder queryParams = new StringBuilder("?");
            
            try {
                // Add orderId if available
                if (result.getOrderId() != null && !result.getOrderId().isEmpty()) {
                    queryParams.append("orderId=").append(URLEncoder.encode(result.getOrderId(), StandardCharsets.UTF_8));
                    queryParams.append("&");
                }
                
                // Add status
                queryParams.append("status=").append(URLEncoder.encode(status, StandardCharsets.UTF_8));
                
                // Add message if available
                if (result.getMessage() != null && !result.getMessage().isEmpty()) {
                    queryParams.append("&message=").append(URLEncoder.encode(result.getMessage(), StandardCharsets.UTF_8));
                }
            } catch (Exception e) {
                logger.warning("Error encoding URL parameters: " + e.getMessage());
                // Fallback to non-encoded params if encoding fails
                queryParams = new StringBuilder("?status=").append(status);
                if (result.getOrderId() != null) {
                    queryParams.append("&orderId=").append(result.getOrderId());
                }
            }
            
            String fullRedirectUrl = frontendRedirectUrl + path + queryParams;
            logger.info("Redirecting user to frontend: " + fullRedirectUrl);
            return new RedirectView(fullRedirectUrl);
        } catch (Exception e) {
            logger.severe("Error handling VNPay return URL: " + e.getMessage());
            e.printStackTrace(); // Add stack trace for better debugging
            // Redirect to error page in case of any exception
            return new RedirectView(vnpayConfig.getFrontendReturnUrlBase() + "/payment-failed?error=technical&message=system_error");
        }
    }

    /**
     * Health check endpoint for IPN URL
     * Kiểm tra xem IPN URL có hoạt động và có thể nhận request không
     */
    @GetMapping("/ipn/health")
    public ResponseEntity<Map<String, Object>> ipnHealthCheck() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "healthy");
            response.put("message", "IPN endpoint is accessible");
            response.put("timestamp", new Date());
            response.put("endpoint", "/api/v1/payment/vnpay/ipn");
            response.put("ssl_required", true);
            response.put("method", "GET");
            response.put("current_ngrok_url", ngrokBaseUrl);
            response.put("current_frontend_url", frontendUrl);
            response.put("full_ipn_url", ngrokBaseUrl + "/api/v1/payment/vnpay/ipn");
            response.put("full_return_url", ngrokBaseUrl + "/api/v1/payment/vnpay/return");
            logger.info("IPN health check performed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "IPN endpoint error: " + e.getMessage());
            response.put("timestamp", new Date());
            logger.severe("IPN health check failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Endpoint để lấy thông tin cấu hình hiện tại
     * Giúp developer kiểm tra các URL đang được sử dụng
     */
    @GetMapping("/config/info")
    public ResponseEntity<Map<String, Object>> getConfigInfo() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            response.put("ngrok_base_url", ngrokBaseUrl);
            response.put("frontend_url", frontendUrl);
            response.put("vnpay_ipn_url", ngrokBaseUrl + "/api/v1/payment/vnpay/ipn");
            response.put("vnpay_return_url", ngrokBaseUrl + "/api/v1/payment/vnpay/return");
            response.put("frontend_return_url_base", vnpayConfig.getFrontendReturnUrlBase());
            response.put("timestamp", new Date());
            response.put("status", "config_retrieved");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to get config info: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Endpoint để lấy thông tin debug về các request IPN gần đây
     * Giúp developer theo dõi và debug các vấn đề IPN
     */
    @GetMapping("/ipn/debug-info")
    public ResponseEntity<Map<String, Object>> getIpnDebugInfo() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            response.put("endpoint_info", Map.of(
                "ipn_url", "/api/v1/payment/vnpay/ipn",
                "method", "GET",
                "ssl_required", true,
                "description", "VNPay IPN notification endpoint",
                "current_full_url", ngrokBaseUrl + "/api/v1/payment/vnpay/ipn"
            ));
            
            response.put("expected_parameters", Arrays.asList(
                "vnp_Amount", "vnp_BankCode", "vnp_BankTranNo", "vnp_CardType",
                "vnp_OrderInfo", "vnp_PayDate", "vnp_ResponseCode", "vnp_TmnCode",
                "vnp_TransactionNo", "vnp_TransactionStatus", "vnp_TxnRef", "vnp_SecureHash"
            ));
            
            response.put("response_codes", Map.of(
                "00", "Confirm Success - Ghi nhận thanh toán thành công",
                "01", "Order not Found - Không tìm thấy giao dịch", 
                "02", "Order already confirmed - Giao dịch đã được xử lý trước đó",
                "04", "Invalid Amount - Số tiền không hợp lệ",
                "97", "Invalid Checksum - Sai chữ ký",
                "99", "Unknown error - Lỗi không xác định"
            ));
            
            response.put("validation_steps", Arrays.asList(
                "1. Check required parameters (vnp_TxnRef, vnp_SecureHash)",
                "2. Verify signature/checksum", 
                "3. Find transaction in database",
                "4. Check transaction status",
                "5. Validate amount",
                "6. Update payment status"
            ));
            
            response.put("current_configuration", Map.of(
                "ngrok_url", ngrokBaseUrl,
                "frontend_url", frontendUrl,
                "ipn_endpoint", ngrokBaseUrl + "/api/v1/payment/vnpay/ipn",
                "return_endpoint", ngrokBaseUrl + "/api/v1/payment/vnpay/return"
            ));
            
            response.put("timestamp", new Date());
            response.put("status", "info_retrieved");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to get debug info: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    

    private Map<String, String> getVnpayParamsMap(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String fieldName = paramNames.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Ghi log để debug
                logger.fine("VNPay parameter: " + fieldName + " = " + fieldValue);
                
                // Đảm bảo không thay đổi các giá trị tham số
                params.put(fieldName, fieldValue);
            }
        }
        return params;
    }
} 