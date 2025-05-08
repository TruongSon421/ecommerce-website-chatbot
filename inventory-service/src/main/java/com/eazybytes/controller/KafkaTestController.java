package com.eazybytes.controller;

import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.ReserveInventoryRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Controller để kiểm tra chức năng xử lý tồn kho qua Kafka
 */
@RestController
@RequestMapping("/api/kafka-test")
public class KafkaTestController {
    private static final Logger logger = LoggerFactory.getLogger(KafkaTestController.class);
    
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    
    @Value("${kafka.topics.reserve-inventory-request}")
    private String reserveInventoryTopic;
    
    @PostMapping("/send-reserve")
    public ResponseEntity<String> sendReserveMessage(@RequestBody List<CartItemResponse> items) {
        try {
            // Tạo một ReserveInventoryRequest
            String transactionId = UUID.randomUUID().toString();
            String orderId = "test-" + System.currentTimeMillis();
            
            ReserveInventoryRequest request = ReserveInventoryRequest.builder()
                    .transactionId(transactionId)
                    .orderId(orderId)
                    .items(items)
                    .reservationExpiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();
            
            logger.info("Gửi message đặt trước tồn kho: {}", request);
            
            // Tạo message với headers
            Message<ReserveInventoryRequest> message = MessageBuilder
                    .withPayload(request)
                    .setHeader(KafkaHeaders.TOPIC, reserveInventoryTopic)
                    .setHeader(KafkaHeaders.KEY, transactionId)
                    .setHeader("type", "reserve-inventory-request")
                    .build();
            
            // Gửi message với headers
            kafkaTemplate.send(message);
            
            return ResponseEntity.ok("Đã gửi yêu cầu đặt trước tồn kho với orderId: " + orderId);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi message Kafka", e);
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/send-direct")
    public ResponseEntity<String> sendDirectReserveMessage(@RequestBody List<CartItemResponse> items) {
        try {
            // Tạo một ReserveInventoryRequest
            String transactionId = UUID.randomUUID().toString();
            String orderId = "direct-" + System.currentTimeMillis();
            
            ReserveInventoryRequest request = ReserveInventoryRequest.builder()
                    .transactionId(transactionId)
                    .orderId(orderId)
                    .items(items)
                    .reservationExpiresAt(LocalDateTime.now().plusMinutes(10))
                    .build();
            
            logger.info("Gửi trực tiếp message đặt trước tồn kho: {}", request);
            
            // Gửi message trực tiếp tới topic
            kafkaTemplate.send(reserveInventoryTopic, transactionId, request);
            
            return ResponseEntity.ok("Đã gửi trực tiếp yêu cầu đặt trước tồn kho với orderId: " + orderId);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi message Kafka", e);
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
} 