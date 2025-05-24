package com.eazybytes.util;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import java.util.logging.Logger;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class để test và kiểm tra IPN URL của VNPay
 * Giúp developer verify xem IPN endpoint có hoạt động đúng không
 */
@Component
public class VNPayIPNTester {
    
    private static final Logger logger = Logger.getLogger(VNPayIPNTester.class.getName());
    private final RestTemplate restTemplate;
    
    public VNPayIPNTester() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Kiểm tra tổng thể IPN URL health
     */
    public Map<String, Object> performComprehensiveIpnCheck(String baseUrl) {
        Map<String, Object> result = new HashMap<>();
        result.put("test_timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        result.put("base_url", baseUrl);
        
        List<Map<String, Object>> testResults = new ArrayList<>();
        
        // Test 1: Health Check
        testResults.add(testHealthCheck(baseUrl));
        
        // Test 2: Debug Info Check  
        testResults.add(testDebugInfo(baseUrl));
        
        // Test 3: SSL/HTTPS Check
        testResults.add(testSSLConnection(baseUrl));
        
        // Test 4: IPN Endpoint Accessibility
        testResults.add(testIpnEndpointAccessibility(baseUrl));
        
        result.put("test_results", testResults);
        result.put("overall_status", calculateOverallStatus(testResults));
        
        return result;
    }
    
    /**
     * Test health check endpoint
     */
    private Map<String, Object> testHealthCheck(String baseUrl) {
        Map<String, Object> test = new HashMap<>();
        test.put("test_name", "Health Check");
        test.put("description", "Kiểm tra endpoint health check");
        
        try {
            String url = baseUrl + "/api/v1/payment/vnpay/ipn/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            test.put("status", "PASS");
            test.put("http_status", response.getStatusCode().value());
            test.put("response", response.getBody());
            test.put("url_tested", url);
            
            logger.info("Health check test passed for: " + url);
            
        } catch (Exception e) {
            test.put("status", "FAIL");
            test.put("error", e.getMessage());
            test.put("details", "Cannot access health check endpoint");
            
            logger.warning("Health check test failed: " + e.getMessage());
        }
        
        return test;
    }
    
    /**
     * Test debug info endpoint
     */
    private Map<String, Object> testDebugInfo(String baseUrl) {
        Map<String, Object> test = new HashMap<>();
        test.put("test_name", "Debug Info Check");
        test.put("description", "Kiểm tra thông tin debug của IPN");
        
        try {
            String url = baseUrl + "/api/v1/payment/vnpay/ipn/debug-info";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            test.put("status", "PASS");
            test.put("http_status", response.getStatusCode().value());
            test.put("response", response.getBody());
            test.put("url_tested", url);
            
            logger.info("Debug info test passed for: " + url);
            
        } catch (Exception e) {
            test.put("status", "FAIL");
            test.put("error", e.getMessage());
            test.put("details", "Cannot access debug info endpoint");
            
            logger.warning("Debug info test failed: " + e.getMessage());
        }
        
        return test;
    }
    
    /**
     * Test SSL/HTTPS connection
     */
    private Map<String, Object> testSSLConnection(String baseUrl) {
        Map<String, Object> test = new HashMap<>();
        test.put("test_name", "SSL/HTTPS Check");
        test.put("description", "Kiểm tra kết nối SSL (bắt buộc cho IPN)");
        
        try {
            URL url = new URL(baseUrl);
            boolean isHttps = "https".equalsIgnoreCase(url.getProtocol());
            
            if (isHttps) {
                test.put("status", "PASS");
                test.put("details", "URL sử dụng HTTPS - đạt yêu cầu VNPay");
                test.put("protocol", "HTTPS");
            } else {
                test.put("status", "FAIL");
                test.put("details", "URL không sử dụng HTTPS - VNPay yêu cầu SSL");
                test.put("protocol", url.getProtocol().toUpperCase());
                test.put("recommendation", "Cần chuyển sang HTTPS để VNPay có thể gọi IPN");
            }
            
            test.put("base_url", baseUrl);
            
        } catch (Exception e) {
            test.put("status", "ERROR");
            test.put("error", e.getMessage());
            test.put("details", "Không thể parse URL");
        }
        
        return test;
    }
    
    /**
     * Test IPN endpoint accessibility
     */
    private Map<String, Object> testIpnEndpointAccessibility(String baseUrl) {
        Map<String, Object> test = new HashMap<>();
        test.put("test_name", "IPN Endpoint Accessibility");
        test.put("description", "Kiểm tra khả năng truy cập endpoint IPN thực tế");
        
        try {
            String url = baseUrl + "/api/v1/payment/vnpay/ipn";
            
            // Test với GET request (như VNPay sẽ call)
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            // IPN endpoint should respond even without parameters (though it may return error codes)
            test.put("status", "PASS");
            test.put("http_status", response.getStatusCode().value());
            test.put("url_tested", url);
            test.put("details", "Endpoint có thể truy cập được");
            test.put("response_preview", response.getBody() != null ? 
                response.getBody().substring(0, Math.min(200, response.getBody().length())) : "No response body");
            
            logger.info("IPN endpoint accessibility test passed for: " + url);
            
        } catch (Exception e) {
            test.put("status", "FAIL");
            test.put("error", e.getMessage());
            test.put("details", "Không thể truy cập IPN endpoint");
            test.put("recommendation", "Kiểm tra server có đang chạy và firewall/routing");
            
            logger.warning("IPN endpoint accessibility test failed: " + e.getMessage());
        }
        
        return test;
    }
    
    /**
     * Simulate VNPay IPN call với test data
     */
    public Map<String, Object> simulateVNPayIpnCall(String baseUrl, Map<String, String> testData) {
        Map<String, Object> result = new HashMap<>();
        result.put("test_name", "Simulate VNPay IPN Call");
        result.put("test_timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        try {
            String url = baseUrl + "/api/v1/payment/vnpay/ipn";
            
            // Build query parameters như VNPay sẽ gửi
            StringBuilder queryParams = new StringBuilder("?");
            for (Map.Entry<String, String> entry : testData.entrySet()) {
                queryParams.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
            }
            
            String fullUrl = url + queryParams.toString();
            if (fullUrl.endsWith("&")) {
                fullUrl = fullUrl.substring(0, fullUrl.length() - 1);
            }
            
            // Call IPN endpoint
            ResponseEntity<String> response = restTemplate.getForEntity(fullUrl, String.class);
            
            result.put("status", "COMPLETED");
            result.put("http_status", response.getStatusCode().value());
            result.put("url_called", fullUrl);
            result.put("response", response.getBody());
            result.put("test_data_sent", testData);
            
            // Parse response để kiểm tra RspCode
            String responseBody = response.getBody();
            if (responseBody != null && responseBody.contains("RspCode")) {
                result.put("vnpay_response_parsed", true);
                if (responseBody.contains("\"00\"")) {
                    result.put("payment_status", "SUCCESS");
                } else if (responseBody.contains("\"01\"")) {
                    result.put("payment_status", "ORDER_NOT_FOUND");
                } else if (responseBody.contains("\"97\"")) {
                    result.put("payment_status", "INVALID_SIGNATURE");
                } else {
                    result.put("payment_status", "OTHER_ERROR");
                }
            }
            
            logger.info("Simulated VNPay IPN call completed successfully");
            
        } catch (Exception e) {
            result.put("status", "FAILED");
            result.put("error", e.getMessage());
            result.put("details", "Simulation failed");
            
            logger.severe("Simulated VNPay IPN call failed: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Generate sample test data cho VNPay IPN
     */
    public Map<String, String> generateSampleIpnData() {
        Map<String, String> sampleData = new HashMap<>();
        
        String txnRef = "TEST_" + System.currentTimeMillis();
        
        sampleData.put("vnp_Amount", "100000"); // 1000 VND
        sampleData.put("vnp_BankCode", "NCB");
        sampleData.put("vnp_BankTranNo", "VNP" + System.currentTimeMillis());
        sampleData.put("vnp_CardType", "ATM");
        sampleData.put("vnp_OrderInfo", "Test payment " + txnRef);
        sampleData.put("vnp_PayDate", "20240101120000");
        sampleData.put("vnp_ResponseCode", "00");
        sampleData.put("vnp_TmnCode", "TESTMERCHANT");
        sampleData.put("vnp_TransactionNo", "14200000");
        sampleData.put("vnp_TransactionStatus", "00");
        sampleData.put("vnp_TxnRef", txnRef);
        sampleData.put("vnp_SecureHash", "sample_hash_for_testing");
        
        return sampleData;
    }
    
    /**
     * Calculate overall status từ các test results
     */
    private String calculateOverallStatus(List<Map<String, Object>> testResults) {
        long passCount = testResults.stream()
            .mapToLong(test -> "PASS".equals(test.get("status")) ? 1 : 0)
            .sum();
            
        long totalTests = testResults.size();
        
        if (passCount == totalTests) {
            return "ALL_PASS";
        } else if (passCount > totalTests / 2) {
            return "MOSTLY_PASS";
        } else {
            return "MULTIPLE_FAILURES";
        }
    }
    
    /**
     * Generate comprehensive test report
     */
    public Map<String, Object> generateTestReport(String baseUrl) {
        Map<String, Object> report = new HashMap<>();
        
        // Comprehensive check
        Map<String, Object> comprehensiveCheck = performComprehensiveIpnCheck(baseUrl);
        
        // Sample simulation
        Map<String, String> sampleData = generateSampleIpnData();
        Map<String, Object> simulationResult = simulateVNPayIpnCall(baseUrl, sampleData);
        
        report.put("comprehensive_check", comprehensiveCheck);
        report.put("simulation_test", simulationResult);
        report.put("report_generated_at", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        // Summary
        String overallHealth = (String) comprehensiveCheck.get("overall_status");
        String simulationStatus = (String) simulationResult.get("status");
        
        if ("ALL_PASS".equals(overallHealth) && "COMPLETED".equals(simulationStatus)) {
            report.put("summary", "IPN URL is healthy and functioning properly");
            report.put("recommendation", "Ready for production use with VNPay");
        } else {
            report.put("summary", "IPN URL has some issues that need attention");
            report.put("recommendation", "Review test results and fix issues before using with VNPay");
        }
        
        return report;
    }
} 