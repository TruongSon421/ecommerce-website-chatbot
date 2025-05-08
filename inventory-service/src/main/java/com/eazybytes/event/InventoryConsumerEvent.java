package com.eazybytes.event;

import com.eazybytes.dto.CancelInventoryReservationRequest;
import com.eazybytes.dto.ConfirmInventoryReservationRequest;
import com.eazybytes.dto.ReserveInventoryRequest;
import com.eazybytes.event.model.InventoryConfirmedEvent;
import com.eazybytes.event.model.InventoryReservationFailedEvent;
import com.eazybytes.event.model.InventoryReservedEvent;
import com.eazybytes.service.InventoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class InventoryConsumerEvent {
    private static final Logger logger = LoggerFactory.getLogger(InventoryConsumerEvent.class);
    
    @Autowired
    private InventoryProducerEvent producer;
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(
            topics = {
                    "${kafka.topics.reserve-inventory-request}",
                    "${kafka.topics.confirm-inventory-reservation}",
                    "${kafka.topics.cancel-inventory-reservation}"
            },
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeRequest(
                              @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                              Acknowledgment acknowledgment,
                              @Payload Object payload) {
        try {
            logger.info("Received payload from topic {}: {}", topic, payload);
            
            Object actualPayload = payload;
            
            // Xử lý trường hợp payload là ConsumerRecord
            if (payload instanceof org.apache.kafka.clients.consumer.ConsumerRecord) {
                org.apache.kafka.clients.consumer.ConsumerRecord<?, ?> record = 
                        (org.apache.kafka.clients.consumer.ConsumerRecord<?, ?>) payload;
                actualPayload = record.value();
                logger.info("Extracted actual payload from ConsumerRecord: {}", actualPayload);
            }
            
            // Xử lý payload dựa vào kiểu nhận được
            if (actualPayload instanceof ReserveInventoryRequest) {
                handleReserveInventoryRequest((ReserveInventoryRequest) actualPayload);
            } else if (actualPayload instanceof ConfirmInventoryReservationRequest) {
                handleConfirmInventoryRequest((ConfirmInventoryReservationRequest) actualPayload);
            } else if (actualPayload instanceof CancelInventoryReservationRequest) {
                handleCancelInventoryRequest((CancelInventoryReservationRequest) actualPayload);
            } else if (actualPayload instanceof Map) {
                // Trường hợp nó đến dưới dạng Map (thường là từ JSON)
                handleMapPayload((Map<String, Object>) actualPayload, topic);
            } else if (actualPayload instanceof String) {
                // Trường hợp nó đến dưới dạng String
                handleStringPayload((String) actualPayload, topic);
            } else {
                logger.warn("Unknown payload type: {} on topic {}", actualPayload.getClass().getName(), topic);
                // Chấp nhận message và ghi log, không throws exception
            }
            
            // Acknowledge message
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
                logger.debug("Message acknowledged on topic {}", topic);
            }
        } catch (Exception e) {
            logger.error("Error processing message on topic {}: {}", topic, e.getMessage(), e);
            
            if (acknowledgment != null) {
                // Vẫn acknowledge để không bị treo, nhưng đã log lỗi
                acknowledgment.acknowledge();
                logger.warn("Message acknowledged despite error to prevent blocking");
            }
        }
    }

    private void handleMapPayload(Map<String, Object> payload, String topic) {
        try {
            // Xử lý trường hợp từ order-service gửi qua với type là đầy đủ tên class
            if (payload.containsKey("transactionId") && payload.containsKey("orderId")) {
                if (payload.containsKey("items") && payload.containsKey("reservationExpiresAt")) {
                    // Đây là ReserveInventoryRequest
                    ReserveInventoryRequest request = objectMapper.convertValue(payload, ReserveInventoryRequest.class);
                    handleReserveInventoryRequest(request);
                    return;
                } else if (payload.containsKey("items") && !payload.containsKey("reservationExpiresAt")) {
                    // Đây là ConfirmInventoryReservationRequest
                    ConfirmInventoryReservationRequest request = objectMapper.convertValue(payload, ConfirmInventoryReservationRequest.class);
                    handleConfirmInventoryRequest(request);
                    return;
                } else if (!payload.containsKey("items")) {
                    // Đây là CancelInventoryReservationRequest
                    CancelInventoryReservationRequest request = objectMapper.convertValue(payload, CancelInventoryReservationRequest.class);
                    handleCancelInventoryRequest(request);
                    return;
                }
            }
            
            // Nếu không xác định được, thử chuyển map thành JSON string trước khi parse
            String jsonString = objectMapper.writeValueAsString(payload);
            
            if (topic.contains("reserve-inventory-request")) {
                ReserveInventoryRequest request = objectMapper.readValue(jsonString, ReserveInventoryRequest.class);
                handleReserveInventoryRequest(request);
            } else if (topic.contains("confirm-inventory-reservation")) {
                ConfirmInventoryReservationRequest request = objectMapper.readValue(jsonString, ConfirmInventoryReservationRequest.class);
                handleConfirmInventoryRequest(request);
            } else if (topic.contains("cancel-inventory-reservation")) {
                CancelInventoryReservationRequest request = objectMapper.readValue(jsonString, CancelInventoryReservationRequest.class);
                handleCancelInventoryRequest(request);
            }
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize map payload: {}", e.getMessage(), e);
            throw new RuntimeException("Deserialization error", e);
        }
    }
    
    private void handleStringPayload(String payload, String topic) {
        try {
            if (topic.contains("reserve-inventory-request")) {
                ReserveInventoryRequest request = objectMapper.readValue(payload, ReserveInventoryRequest.class);
                handleReserveInventoryRequest(request);
            } else if (topic.contains("confirm-inventory-reservation")) {
                ConfirmInventoryReservationRequest request = objectMapper.readValue(payload, ConfirmInventoryReservationRequest.class);
                handleConfirmInventoryRequest(request);
            } else if (topic.contains("cancel-inventory-reservation")) {
                CancelInventoryReservationRequest request = objectMapper.readValue(payload, CancelInventoryReservationRequest.class);
                handleCancelInventoryRequest(request);
            }
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize string payload: {}", e.getMessage(), e);
            throw new RuntimeException("Deserialization error", e);
        }
    }

    private void handleReserveInventoryRequest(ReserveInventoryRequest request) {
        try {
            logger.info("Processing reserve inventory request for order: {}", request.getOrderId());
            
            // Đảm bảo có expiresAt
            if (request.getReservationExpiresAt() == null) {
                request.setReservationExpiresAt(LocalDateTime.now().plusMinutes(10));
                logger.info("Set default expiration time for order {}: {}", 
                          request.getOrderId(), request.getReservationExpiresAt());
            }
            
            // Đảm bảo danh sách items không null
            if (request.getItems() == null || request.getItems().isEmpty()) {
                logger.error("Items list is null or empty for order {}", request.getOrderId());
                InventoryReservationFailedEvent failedEvent = InventoryReservationFailedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(null)
                        .reason("Failed to reserve inventory: Items list is null or empty")
                        .build();
                producer.sendInventoryEvent(failedEvent);
                return;
            }
            
            // Thử xử lý với retry logic đơn giản
            int maxRetries = 3;
            int retryCount = 0;
            boolean success = false;
            Exception lastException = null;
            
            while (retryCount < maxRetries && !success) {
                try {
                    inventoryService.reserveInventory(request);
                    success = true;
                } catch (Exception e) {
                    lastException = e;
                    logger.warn("Error on attempt {}/{}: {}", 
                              retryCount + 1, maxRetries, e.getMessage());
                    retryCount++;
                    
                    if (retryCount < maxRetries) {
                        try {
                            // Delay tăng dần theo số lần retry
                            Thread.sleep(1000 * retryCount);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }
            
            if (success) {
                InventoryReservedEvent event = InventoryReservedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .build();
                producer.sendInventoryEvent(event);
                logger.info("Reserved inventory for order {}", request.getOrderId());
            } else {
                logger.error("Failed to reserve inventory for order {} after {} attempts: {}", 
                          request.getOrderId(), retryCount, lastException != null ? lastException.getMessage() : "Unknown error");
                
                InventoryReservationFailedEvent failedEvent = InventoryReservationFailedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .reason("Failed to reserve inventory after " + retryCount + " attempts: " + 
                               (lastException != null ? lastException.getMessage() : "Unknown error"))
                        .build();
                producer.sendInventoryEvent(failedEvent);
                
                if (lastException != null) {
                    throw new RuntimeException("Failed to process reserve inventory request", lastException);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to reserve inventory for order {}: {}", request.getOrderId(), e.getMessage(), e);
            
            try {
                InventoryReservationFailedEvent failedEvent = InventoryReservationFailedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .reason("Failed to reserve inventory: " + e.getMessage())
                        .build();
                producer.sendInventoryEvent(failedEvent);
            } catch (Exception ex) {
                logger.error("Also failed to send failed event: {}", ex.getMessage(), ex);
            }
            
            throw new RuntimeException("Failed to process reserve inventory request", e);
        }
    }

    private void handleConfirmInventoryRequest(ConfirmInventoryReservationRequest request) {
        try {
            logger.info("Processing confirm inventory request for order: {}", request.getOrderId());
            inventoryService.confirmReservation(request);

            InventoryConfirmedEvent event = InventoryConfirmedEvent.builder()
                    .transactionId(request.getTransactionId())
                    .orderId(request.getOrderId())
                    .items(request.getItems())
                    .build();
            producer.sendInventoryEvent(event);
            logger.info("Confirmed inventory for order {}", request.getOrderId());
        } catch (Exception e) {
            logger.error("Failed to confirm inventory for order {}: {}", request.getOrderId(), e.getMessage(), e);
            
            try {
                InventoryReservationFailedEvent failedEvent = InventoryReservationFailedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .reason("Failed to confirm inventory: " + e.getMessage())
                        .build();
                producer.sendInventoryEvent(failedEvent);
            } catch (Exception ex) {
                logger.error("Also failed to send failed event: {}", ex.getMessage(), ex);
            }
            
            throw new RuntimeException("Failed to process confirm inventory request", e);
        }
    }

    private void handleCancelInventoryRequest(CancelInventoryReservationRequest request) {
        try {
            logger.info("Processing cancel inventory request for order: {}", request.getOrderId());
            inventoryService.cancelReservation(request);
            logger.info("Cancelled inventory reservation for order {}", request.getOrderId());
        } catch (Exception e) {
            logger.error("Failed to cancel inventory for order {}: {}", request.getOrderId(), e.getMessage(), e);
            throw new RuntimeException("Failed to process cancel inventory request", e);
        }
    }
}