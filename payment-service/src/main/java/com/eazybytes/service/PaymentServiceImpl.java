// com/eazybytes/payment/service/PaymentServiceImpl.java
package com.eazybytes.service;

import com.eazybytes.event.PaymentProducer;
import com.eazybytes.event.model.PaymentFailedEvent;
import com.eazybytes.event.model.PaymentSucceededEvent;
import com.eazybytes.event.model.ProcessPaymentRequest;
import com.eazybytes.model.Payment;
import com.eazybytes.repository.PaymentRepository;

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

    private final PaymentProducer paymentProducer;
    private final PaymentRepository paymentRepository;
    private final Random random = new Random();

    @Override
    @Transactional
    public void handlePaymentRequest(ProcessPaymentRequest request) {
        Long orderUuid;
        String invalidOrderIdReason = "Invalid Order ID format";
        try {
            orderUuid = Long.fromString(request.getOrderId());
        } catch (IllegalArgumentException e) {
            log.error("{} received: {}", invalidOrderIdReason, request.getOrderId());
            // Gọi lại constructor với reason
            paymentProducer.sendPaymentFailedEvent(new PaymentFailedEvent(
                    request.getTransactionId(),
                    request.getUserId(),
                    null, // OrderId không hợp lệ
                    invalidOrderIdReason
            ));
            return;
        }

        log.info("Handling payment request for orderId: {}, transactionId: {}", orderUuid, request.getTransactionId());

        // 1. Kiểm tra Idempotency
        Optional<Payment> existingPaymentOpt = paymentRepository.findByTransactionId(request.getTransactionId());
        if (existingPaymentOpt.isPresent()) {
             Payment existingPayment = existingPaymentOpt.get();
             String idempotencyReason = "Payment previously failed";
             log.warn("Payment request already processed for transactionId: {}. Current status: {}", request.getTransactionId(), existingPayment.getStatus());
             if (existingPayment.getStatus() == Payment.PaymentStatus.SUCCESS) {
                 paymentProducer.sendPaymentSucceededEvent(new PaymentSucceededEvent(
                         existingPayment.getTransactionId(),
                         request.getUserId(),
                         existingPayment.getOrderId(),
                         existingPayment.getPaymentId()
                 ));
             } else if (existingPayment.getStatus() == Payment.PaymentStatus.FAILED) {
                 // Gọi lại constructor với reason (lấy từ bản ghi cũ nếu có)
                 paymentProducer.sendPaymentFailedEvent(new PaymentFailedEvent(
                         existingPayment.getTransactionId(),
                         request.getUserId(),
                         existingPayment.getOrderId(),
                         existingPayment.getFailureReason() != null ? existingPayment.getFailureReason() : idempotencyReason
                 ));
             }
             return;
        }

        // 2. Tạo bản ghi Payment mới với trạng thái PENDING
        Payment newPayment = new Payment();
        newPayment.setOrderId(orderUuid);
        newPayment.setTransactionId(request.getTransactionId());
        newPayment.setAmount(request.getTotalAmount());
        String invalidMethodReason = "Invalid payment method: " + request.getPaymentMethod();
        try {
            newPayment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
        } catch (IllegalArgumentException e) {
             log.error(invalidMethodReason);
             newPayment.setStatus(Payment.PaymentStatus.FAILED);
             newPayment.setFailureReason(invalidMethodReason); // Set lại reason
             newPayment.setOrderId(orderUuid);
             paymentRepository.save(newPayment);
             // Gọi lại constructor với reason
             paymentProducer.sendPaymentFailedEvent(new PaymentFailedEvent(
                    request.getTransactionId(),
                    request.getUserId(),
                    orderUuid,
                    invalidMethodReason
            ));
            return;
        }
        newPayment.setStatus(Payment.PaymentStatus.PENDING);
        newPayment.setPaymentId(UUID.randomUUID().toString());

        Payment pendingPayment = paymentRepository.save(newPayment);
        log.info("Payment record created with ID {} and status PENDING for transactionId: {}", pendingPayment.getId(), pendingPayment.getTransactionId());

        // 3. Giả lập xử lý thanh toán
        boolean paymentSuccess = simulatePaymentProcessing();
        String simulatedFailureReason = "Payment gateway declined"; // Lý do giả lập

        // 4. Cập nhật trạng thái Payment và gửi sự kiện kết quả
        try {
            Payment paymentToUpdate = paymentRepository.findById(pendingPayment.getId())
                    .orElseThrow(() -> new RuntimeException("Concurrency issue: Payment record not found after saving. ID: " + pendingPayment.getId()));

            if (paymentSuccess) {
                paymentToUpdate.setStatus(Payment.PaymentStatus.SUCCESS);
                paymentRepository.save(paymentToUpdate);
                log.info("Payment SUCCESS for transactionId: {}", paymentToUpdate.getTransactionId());
                paymentProducer.sendPaymentSucceededEvent(new PaymentSucceededEvent(
                        paymentToUpdate.getTransactionId(),
                        request.getUserId(),
                        paymentToUpdate.getOrderId(),
                        paymentToUpdate.getPaymentId()
                ));
            } else {
                paymentToUpdate.setStatus(Payment.PaymentStatus.FAILED);
                paymentToUpdate.setFailureReason(simulatedFailureReason); // Set lại reason
                paymentRepository.save(paymentToUpdate);
                log.info("Payment FAILED for transactionId: {}. Reason: {}", paymentToUpdate.getTransactionId(), simulatedFailureReason);
                 // Gọi lại constructor với reason
                paymentProducer.sendPaymentFailedEvent(new PaymentFailedEvent(
                        paymentToUpdate.getTransactionId(),
                        request.getUserId(),
                        paymentToUpdate.getOrderId(),
                        simulatedFailureReason
                ));
            }
        } catch (Exception e) {
             String updateErrorReason = "Error during status update: " + e.getMessage();
             log.error("Error finalizing payment status or sending event for transactionId {}: {}", request.getTransactionId(), e.getMessage(), e);
             if (!paymentSuccess) {
                  // Gọi lại constructor với reason
                  paymentProducer.sendPaymentFailedEvent(new PaymentFailedEvent(
                       request.getTransactionId(),
                       request.getUserId(),
                       orderUuid,
                       updateErrorReason
               ));
             }
             // Cân nhắc: Nếu lỗi xảy ra sau khi thanh toán thành công nhưng trước khi gửi event SUCCESS,
             // bạn có thể muốn lưu lại trạng thái lỗi đặc biệt hoặc retry gửi event SUCCESS.
             // Ném lỗi ra để transaction rollback và Kafka không ack (cho phép retry).
             throw new RuntimeException("Error finalizing payment status", e);
        }
    }

    @Override
    public Payment getPaymentByOrderId(UUID orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));
    }

    private boolean simulatePaymentProcessing() {
        try {
             Thread.sleep(100 + random.nextInt(400));
         } catch (InterruptedException e) {
             Thread.currentThread().interrupt();
         }
         return random.nextInt(10) < 8;
    }
}