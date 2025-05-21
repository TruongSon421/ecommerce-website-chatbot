package com.eazybytes.service;

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

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentProducer paymentProducer;

    @Transactional
    @Override
    public void processPayment(ProcessPaymentRequest request) {
        log.info("Processing payment for orderId: {}, userId: {}, transactionId: {}", 
                request.getOrderId(), request.getUserId(), request.getTransactionId());

        // Kiểm tra idempotency
        Optional<Payment> existingPayment = paymentRepository.findByTransactionId(request.getTransactionId());
        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            log.info("Payment already processed for transactionId: {}. Status: {}", 
                    request.getTransactionId(), payment.getStatus());
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                paymentProducer.sendPaymentSucceededEvent(PaymentSucceededEvent.builder()
                        .transactionId(payment.getTransactionId())
                        .userId(payment.getUserId())
                        .orderId(payment.getOrderId())
                        .paymentId(payment.getPaymentId())
                        .amount(payment.getAmount())
                        .build());
            } else if (payment.getStatus() == PaymentStatus.FAILED) {
                paymentProducer.sendPaymentFailedEvent(PaymentFailedEvent.builder()
                        .transactionId(payment.getTransactionId())
                        .userId(payment.getUserId())
                        .orderId(payment.getOrderId())
                        .paymentId(payment.getPaymentId())
                        .amount(payment.getAmount())
                        .failureReason(payment.getFailureReason())
                        .build());
            }
            return;
        }

        // Tạo bản ghi Payment mới
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setTransactionId(request.getTransactionId());
        payment.setAmount(String.valueOf(request.getTotalAmount()));
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        try {
            // TODO: Thay thế simulatePaymentProcessing bằng API thanh toán thực tế (ví dụ: Stripe, VNPay)
            // - Gọi API thanh toán với thông tin: amount, paymentMethod, transactionId
            // - Xử lý response từ API để xác định paymentSuccess và failureReason (nếu có)
            boolean paymentSuccess = simulatePaymentProcessing();

            if (paymentSuccess) {
                // Cập nhật trạng thái thành công
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(payment);
                log.info("Payment successful for orderId: {}", request.getOrderId());

                // Gửi sự kiện thành công
                PaymentSucceededEvent succeededEvent = PaymentSucceededEvent.builder()
                        .transactionId(payment.getTransactionId())
                        .userId(payment.getUserId())
                        .orderId(payment.getOrderId())
                        .paymentId(payment.getPaymentId())
                        .amount(payment.getAmount())
                        .build();
                paymentProducer.sendPaymentSucceededEvent(succeededEvent);
            } else {
                // Cập nhật trạng thái thất bại
                String failureReason = "Payment declined by gateway";
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason(failureReason);
                paymentRepository.save(payment);
                log.warn("Payment failed for orderId: {}. Reason: {}", request.getOrderId(), failureReason);

                // Gửi sự kiện thất bại
                PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                        .transactionId(payment.getTransactionId())
                        .userId(payment.getUserId())
                        .orderId(payment.getOrderId())
                        .paymentId(payment.getPaymentId())
                        .amount(payment.getAmount())
                        .failureReason(failureReason)
                        .build();
                paymentProducer.sendPaymentFailedEvent(failedEvent);
            }
        } catch (Exception e) {
            // Xử lý lỗi bất ngờ
            String failureReason = "Internal server error: " + e.getMessage();
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(failureReason);
            paymentRepository.save(payment);
            log.error("Payment processing error for orderId: {}. Error: {}", request.getOrderId(), e.getMessage(), e);

            // Gửi sự kiện thất bại
            PaymentFailedEvent failedEvent = PaymentFailedEvent.builder()
                    .transactionId(payment.getTransactionId())
                    .userId(payment.getUserId())
                    .orderId(payment.getOrderId())
                    .paymentId(payment.getPaymentId())
                    .amount(payment.getAmount())
                    .failureReason(failureReason)
                    .build();
            paymentProducer.sendPaymentFailedEvent(failedEvent);
        }
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


    // TODO: Xóa phương thức này sau khi tích hợp API thanh toán thực tế
    private boolean simulatePaymentProcessing() {
        // Giả lập 80% thành công, 20% thất bại
        return new Random().nextInt(100) < 80;
    }
}