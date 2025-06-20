package com.eazybytes.service;

import com.eazybytes.dto.ConfirmVNPayPaymentResponseDto;
import com.eazybytes.dto.InitiateVNPayPaymentRequestDto;
import com.eazybytes.dto.InitiateVNPayPaymentResponseDto;
import com.eazybytes.event.model.PaymentFailedEvent;
import com.eazybytes.event.model.PaymentSucceededEvent;
import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.model.Payment;
import com.eazybytes.model.Payment.PaymentMethod;
import com.eazybytes.model.Payment.PaymentStatus;
import com.eazybytes.repository.PaymentRepository;
import com.eazybytes.event.PaymentProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentProducer paymentProducer;
    private final VNPayService vnPayService;

    @Transactional
    @Override
    public InitiateVNPayPaymentResponseDto processPayment(ProcessPaymentRequest request) {
        log.info("Processing payment for orderId: {}, userId: {}, transactionId: {}, method: {}", 
                request.getOrderId(), request.getUserId(), request.getTransactionId(), request.getPaymentMethod());

        Optional<Payment> existingPaymentOpt = paymentRepository.findByTransactionId(request.getTransactionId());
        if (existingPaymentOpt.isPresent()) {
            return handleExistingPayment(existingPaymentOpt.get(), request);
        }

        // Create payment record with PENDING status before processing
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setTransactionId(request.getTransactionId());
        payment.setAmount(String.valueOf(request.getTotalAmount()));
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);
        log.info("Created payment record with PENDING status for orderId: {}, transactionId: {}", 
                request.getOrderId(), request.getTransactionId());

        if (isVNPayPaymentMethod(request.getPaymentMethod())) {
            log.info("Processing VNPay payment for orderId: {}", request.getOrderId());
            try {
                // Create request for VNPay
                InitiateVNPayPaymentRequestDto vnPayRequestDto = createVNPayRequest(request);
                String clientIpAddress = request.getClientIpAddress() != null ? request.getClientIpAddress() : "127.0.0.1";

                // Generate payment URL via VNPayService
                String paymentUrl = vnPayService.createPaymentUrl(vnPayRequestDto, clientIpAddress);
                log.info("VNPay URL generated for orderId: {}: {}", request.getOrderId(), paymentUrl);
                
                return new InitiateVNPayPaymentResponseDto(paymentUrl);

            } catch (Exception e) {
                handlePaymentError(request, e);
                throw new RuntimeException("Failed to generate payment URL: " + e.getMessage());
            }
        } else {
            return handleNonVNPayPayment(request);
        }
    }

    private boolean isVNPayPaymentMethod(PaymentMethod paymentMethod) {
        return PaymentMethod.CREDIT_CARD.equals(paymentMethod) ||
               PaymentMethod.DEBIT_CARD.equals(paymentMethod) ||
               PaymentMethod.QR_CODE.equals(paymentMethod) ||
               PaymentMethod.TRANSFER_BANKING.equals(paymentMethod);
    }

    private InitiateVNPayPaymentResponseDto handleExistingPayment(Payment existingPayment, ProcessPaymentRequest request) {
        log.info("Payment already exists for transactionId: {}. Status: {}", 
                existingPayment.getTransactionId(), existingPayment.getStatus());
                
        if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
            sendPaymentSuccessEvent(existingPayment);
            throw new RuntimeException("Payment has already been completed successfully");
        } else if (existingPayment.getStatus() == PaymentStatus.PROCESSING) {
            throw new RuntimeException("Payment is currently being processed");
        } else if (existingPayment.getStatus() == PaymentStatus.FAILED || existingPayment.getStatus() == PaymentStatus.PENDING) {
            // For FAILED or PENDING payments, regenerate URL if it's a VNPay payment
            if (isVNPayPaymentMethod(existingPayment.getPaymentMethod())) {
                try {
                    // Create VNPay request from existing payment
                    InitiateVNPayPaymentRequestDto vnPayRequestDto = new InitiateVNPayPaymentRequestDto();
                    vnPayRequestDto.setTransactionId(existingPayment.getTransactionId());
                    
                    Integer originalAmount = Integer.valueOf(existingPayment.getAmount());
                    long amountInSmallestUnit = (long) originalAmount * 100;
                    vnPayRequestDto.setAmount(amountInSmallestUnit);
                    
                    vnPayRequestDto.setOrderInfo("Thanh toan don hang " + existingPayment.getOrderId());
                    vnPayRequestDto.setOrderId(String.valueOf(existingPayment.getOrderId()));
                    vnPayRequestDto.setBankCode(PaymentMethodToBankCode(existingPayment.getPaymentMethod()));
                    
                    String clientIpAddress = request.getClientIpAddress() != null ? request.getClientIpAddress() : "127.0.0.1";
                    String paymentUrl = vnPayService.createPaymentUrl(vnPayRequestDto, clientIpAddress);
                    
                    // Update status to PENDING if it was FAILED
                    if (existingPayment.getStatus() == PaymentStatus.FAILED) {
                        existingPayment.setStatus(PaymentStatus.PENDING);
                        existingPayment.setFailureReason(null);
                        existingPayment.setUpdatedAt(LocalDateTime.now());
                        paymentRepository.save(existingPayment);
                        log.info("Updated payment status from FAILED to PENDING for orderId: {}", existingPayment.getOrderId());
                    }
                    
                    log.info("Regenerated VNPay URL for existing payment - orderId: {}, transactionId: {}", 
                            existingPayment.getOrderId(), existingPayment.getTransactionId());
                    return new InitiateVNPayPaymentResponseDto(paymentUrl);
                    
                } catch (Exception e) {
                    log.error("Error regenerating payment URL for existing payment - orderId: {}, transactionId: {}. Error: {}", 
                            existingPayment.getOrderId(), existingPayment.getTransactionId(), e.getMessage(), e);
                    throw new RuntimeException("Failed to regenerate payment URL: " + e.getMessage());
                }
            } else {
                // Non-VNPay payment method
                return null;
            }
        }
        
        return null;
    }

    private InitiateVNPayPaymentRequestDto createVNPayRequest(ProcessPaymentRequest request) {
        InitiateVNPayPaymentRequestDto vnPayRequestDto = new InitiateVNPayPaymentRequestDto();
        vnPayRequestDto.setTransactionId(request.getTransactionId());
        
        // VNPay requires amount in the smallest currency unit (multiply by 100)
        // For example: 1,000,000 VND should be sent as 100,000,000
        Integer originalAmount = request.getTotalAmount();
        // Use long to prevent integer overflow when multiplying large amounts
        long amountInSmallestUnit = (long)originalAmount * 100;
        
        log.info("Converting amount for VNPay: Original={}, After multiplication={}", 
                originalAmount, amountInSmallestUnit);
                
        vnPayRequestDto.setAmount(amountInSmallestUnit);
        
        String orderId = String.valueOf(request.getOrderId());
        vnPayRequestDto.setOrderInfo("Thanh toan don hang " + orderId);
        log.info("Setting vnp_OrderInfo with orderId at the end: {}", vnPayRequestDto.getOrderInfo());
        String bankCode = PaymentMethodToBankCode(request.getPaymentMethod());
        vnPayRequestDto.setBankCode(bankCode);
        vnPayRequestDto.setOrderId(orderId);
        return vnPayRequestDto;
    }

    private void handlePaymentError(ProcessPaymentRequest request, Exception e) {
        log.error("Error generating VNPay URL for orderId: {}. Error: {}", request.getOrderId(), e.getMessage(), e);
        
        Payment failedPayment = paymentRepository.findByTransactionId(request.getTransactionId()).orElseGet(() -> {
            Payment tempFailPayment = new Payment();
            tempFailPayment.setOrderId(request.getOrderId());
            tempFailPayment.setUserId(request.getUserId());
            tempFailPayment.setTransactionId(request.getTransactionId());
            tempFailPayment.setAmount(String.valueOf(request.getTotalAmount()));
            tempFailPayment.setPaymentMethod(request.getPaymentMethod());
            tempFailPayment.setStatus(PaymentStatus.FAILED);
            tempFailPayment.setFailureReason("Error during VNPay URL generation: " + e.getMessage());
            return paymentRepository.save(tempFailPayment);
        });

        sendPaymentFailedEvent(failedPayment, "Error generating VNPay URL: " + e.getMessage());
    }

    private InitiateVNPayPaymentResponseDto handleNonVNPayPayment(ProcessPaymentRequest request) {
        log.warn("Payment method {} does not support online payment URL generation.", request.getPaymentMethod());
        
        // Payment record was already created with PENDING status, so no need to create it again
        log.info("Non-VNPay payment recorded with PENDING status for orderId: {}", request.getOrderId());
        
        // TODO: Implement logic for other payment methods if any.
        // For example, if it was a COD, it might be set to PENDING until delivery confirmation.
        
        // Return null for non-VNPay payments since they don't need payment URLs
        // Frontend should handle this case appropriately
        return null;
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId) {
        log.debug("Fetching payment for orderId: {}", orderId);
        Optional<Payment> payment = paymentRepository.findByOrderId(orderId);
        if (payment.isEmpty()) {
            log.warn("No payment found for orderId: {}", orderId);
            throw new RuntimeException("Payment not found for orderId: " + orderId);
        }
        return payment.get();
    }

    @Override
    @Transactional
    public void handleVNPayCallback(Map<String, String> vnpayParams) {
        log.info("Handling VNPay IPN callback with params: {}", vnpayParams);
        
        /*  IPN URL: Ghi nhận kết quả thanh toán từ VNPAY
           Phương thức này chỉ tập trung vào việc cập nhật trạng thái thanh toán
           Các kiểm tra (checksum, orderId, amount, order status) đã được thực hiện trong VnpayController
        */
        
        String vnp_TxnRef = vnpayParams.get("vnp_TxnRef");
        String vnp_ResponseCode = vnpayParams.get("vnp_ResponseCode");
        
        // Tìm giao dịch trong database
        Optional<Payment> paymentOptional = paymentRepository.findByTransactionId(vnp_TxnRef);
        if (paymentOptional.isEmpty()) {
            log.error("Payment record not found for transactionId: {}. Cannot process VNPay IPN.", vnp_TxnRef);
            throw new RuntimeException("Payment not found for transactionId: " + vnp_TxnRef);
        }

        Payment payment = paymentOptional.get();
        
        // Kiểm tra trạng thái thanh toán
        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.info("Payment already processed for transactionId: {}. Current status: {}. Skipping processing.", 
                    vnp_TxnRef, payment.getStatus());
            return;
        }
        
        // Cập nhật trạng thái thanh toán dựa trên mã phản hồi
        boolean isSuccessful = "00".equals(vnp_ResponseCode);
        
        if (isSuccessful) {
            // Cập nhật trạng thái thành SUCCESS
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setUpdatedAt(LocalDateTime.now());
            log.info("Payment status updated to SUCCESS for orderId: {}, transactionId: {}", 
                    payment.getOrderId(), payment.getTransactionId());
                    
            // Lưu vào database
            paymentRepository.save(payment);
            
            // Gửi sự kiện thành công
            sendPaymentSuccessEvent(payment);
        } else {
            // Cập nhật trạng thái thành FAILED
            String failureReason = String.format("VNPay payment failed. ResponseCode: %s", vnp_ResponseCode);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(failureReason);
            payment.setUpdatedAt(LocalDateTime.now());
            
            log.warn("Payment status updated to FAILED for orderId: {}, transactionId: {}", 
                    payment.getOrderId(), payment.getTransactionId());
                    
            // Lưu vào database
            paymentRepository.save(payment);
            
            // Gửi sự kiện thất bại
            sendPaymentFailedEvent(payment, failureReason);
        }
    }
    
    @Override        
    @Transactional        
    public ConfirmVNPayPaymentResponseDto handleVNPayReturnUrl(HttpServletRequest request) {        
        // Delegate to VNPayService for handling return URL and getting result        
        ConfirmVNPayPaymentResponseDto vnpayResponse = vnPayService.handleVNPayReturn(request);                
        
        log.info("Received VNPay return URL result: {}", vnpayResponse);                
        
        // KHÔNG cập nhật database tại Return URL, chỉ trả về kết quả kiểm tra toàn vẹn dữ liệu
        // Việc cập nhật database sẽ được thực hiện tại IPN URL (handleVNPayCallback)
        
        return vnpayResponse;    
    }

    private void sendPaymentSuccessEvent(Payment payment) {
        PaymentSucceededEvent succeededEvent = PaymentSucceededEvent.builder()
                .transactionId(payment.getTransactionId())
                .userId(payment.getUserId())
                .orderId(payment.getOrderId())
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .build();
            
        try {
            paymentProducer.sendPaymentSucceededEvent(succeededEvent);
            log.info("Published PaymentSucceededEvent for orderId: {}, transactionId: {}", 
                    payment.getOrderId(), payment.getTransactionId());
        } catch (Exception e) {
            log.error("Failed to send PaymentSucceededEvent for transactionId: {}. Error: {}", 
                    payment.getTransactionId(), e.getMessage(), e);
            // Set status back to PENDING if event publishing fails
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
        }
    }

    private void sendPaymentFailedEvent(Payment payment, String failureReason) {
        PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                .transactionId(payment.getTransactionId())
                .userId(payment.getUserId())
                .orderId(payment.getOrderId())
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .failureReason(failureReason != null ? failureReason : payment.getFailureReason())
                .build();
            
        try {
            paymentProducer.sendPaymentFailedEvent(failedEvent);
            log.info("Published PaymentFailedEvent for orderId: {}, transactionId: {}", 
                    payment.getOrderId(), payment.getTransactionId());
        } catch (Exception e) {
            log.error("Failed to send PaymentFailedEvent for transactionId: {}. Error: {}", 
                    payment.getTransactionId(), e.getMessage(), e);
            // If event publishing fails, at least keep the FAILED status in database
        }
    }

    @Override
    public Optional<Payment> findPaymentByTransactionId(String transactionId) {
        log.debug("Finding payment by transactionId: {}", transactionId);
        return paymentRepository.findByTransactionId(transactionId);
    }

    private String PaymentMethodToBankCode(PaymentMethod paymentMethod) {
        switch (paymentMethod) {
            case CREDIT_CARD:
                return "INTCARD";
            case DEBIT_CARD:
                return "INTCARD";
            case QR_CODE:
                return "VNPAYQR";
            case TRANSFER_BANKING:
                return "VNBANK";
            default:
                throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
        }
    }
}