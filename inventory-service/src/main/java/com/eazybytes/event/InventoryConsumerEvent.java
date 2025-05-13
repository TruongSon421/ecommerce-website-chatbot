package com.eazybytes.event;

import com.eazybytes.dto.CancelInventoryReservationRequest;
import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.ConfirmInventoryReservationRequest;
import com.eazybytes.dto.ReserveInventoryRequest;
import com.eazybytes.event.model.InventoryConfirmedEvent;
import com.eazybytes.event.model.InventoryReservationFailedEvent;
import com.eazybytes.event.model.InventoryReservedEvent;
import com.eazybytes.model.InventoryReservation;
import com.eazybytes.service.InventoryService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
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
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;

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
        String messageId = UUID.randomUUID().toString().substring(0, 8); // Tạo ID ngắn để theo dõi message
        try {
            logger.info("[{}] Received payload from topic {}: {}", messageId, topic, payload);
            
            Object actualPayload = payload;
            
            // Xử lý trường hợp payload là ConsumerRecord
            if (payload instanceof org.apache.kafka.clients.consumer.ConsumerRecord) {
                org.apache.kafka.clients.consumer.ConsumerRecord<?, ?> record = 
                        (org.apache.kafka.clients.consumer.ConsumerRecord<?, ?>) payload;
                actualPayload = record.value();
                logger.info("[{}] Extracted actual payload from ConsumerRecord: {}", messageId, actualPayload);
            }
            
            // Special handling for different topics
            try {
                if (topic.contains("cancel-inventory-reservation")) {
                    handleCancelInventoryTopic(topic, actualPayload);
                } else if (topic.contains("confirm-inventory-reservation")) {
                    if (actualPayload instanceof ConfirmInventoryReservationRequest) {
                        handleConfirmInventoryRequest((ConfirmInventoryReservationRequest) actualPayload);
                    } else if (actualPayload instanceof Map) {
                        // Xử lý Map payload cho confirm
                        Map<String, Object> map = (Map<String, Object>) actualPayload;
                        ConfirmInventoryReservationRequest request = convertMapToConfirmRequest(map);
                        handleConfirmInventoryRequest(request);
                    } else {
                        logger.warn("[{}] Unknown payload type for confirm-inventory-reservation: {}", 
                                messageId, actualPayload.getClass().getName());
                    }
                } else if (topic.contains("reserve-inventory-request")) {
                    if (actualPayload instanceof ReserveInventoryRequest) {
                        handleReserveInventoryRequest((ReserveInventoryRequest) actualPayload);
                    } else if (actualPayload instanceof Map) {
                        // Xử lý Map payload cho reserve
                        Map<String, Object> map = (Map<String, Object>) actualPayload;
                        ReserveInventoryRequest request = convertMapToReserveRequest(map);
                        handleReserveInventoryRequest(request);
                    } else {
                        logger.warn("[{}] Unknown payload type for reserve-inventory-request: {}", 
                                messageId, actualPayload.getClass().getName());
                    }
                } else {
                    // Fallback xử lý dựa vào kiểu payload
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
                        logger.warn("[{}] Unknown payload type: {} on topic {}", 
                                messageId, actualPayload.getClass().getName(), topic);
                    }
                }
            } catch (Exception e) {
                logger.error("[{}] Error processing message content: {}", messageId, e.getMessage(), e);
                // Không throw exception ra ngoài để đảm bảo message được acknowledge
            }
            
            // Acknowledge message
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
                logger.debug("[{}] Message acknowledged on topic {}", messageId, topic);
            }
        } catch (Exception e) {
            logger.error("[{}] Critical error processing message on topic {}: {}", 
                    messageId, topic, e.getMessage(), e);
            
            if (acknowledgment != null) {
                // Vẫn acknowledge để không bị treo, nhưng đã log lỗi
                acknowledgment.acknowledge();
                logger.warn("[{}] Message acknowledged despite error to prevent blocking", messageId);
            }
        }
    }

    @KafkaListener(
            topics = "${kafka.topics.checkout.failed}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeCheckoutFailedEvent(
                              @Payload Object payload,
                              Acknowledgment acknowledgment) {
        try {
            logger.info("Received checkout failed event: {}", payload);
            
            // Convert to Map since we may not have the exact event class
            Map<String, Object> eventMap;
            if (payload instanceof Map) {
                eventMap = (Map<String, Object>) payload;
            } else {
                eventMap = objectMapper.convertValue(payload, new TypeReference<Map<String, Object>>() {});
            }
            
            // Extract orderId from the event
            String orderId = null;
            if (eventMap.containsKey("orderId")) {
                orderId = eventMap.get("orderId").toString();
            }
            
            if (orderId != null) {
                // Create cancel request
                CancelInventoryReservationRequest cancelRequest = CancelInventoryReservationRequest.builder()
                        .transactionId(eventMap.containsKey("transactionId") ? 
                                       eventMap.get("transactionId").toString() : UUID.randomUUID().toString())
                        .orderId(orderId)
                        .build();
                
                logger.info("Processing inventory cancellation for failed checkout, orderId: {}", orderId);
                inventoryService.cancelReservation(cancelRequest);
                logger.info("Successfully cancelled inventory for failed order {}", orderId);
            } else {
                logger.warn("Received checkout failed event without orderId");
            }
            
            acknowledgment.acknowledge();
        } catch (Exception e) {
            logger.error("Error processing checkout failed event: {}", e.getMessage(), e);
            acknowledgment.acknowledge(); // Still acknowledge to avoid getting stuck
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
            
            // Check if inventory is already reserved for this order to prevent duplicate reservation
            List<InventoryReservation> reservations = inventoryService.getReservationsByOrderId(request.getOrderId());
            boolean alreadyReserved = reservations.stream()
                .anyMatch(res -> res.getStatus() == InventoryReservation.ReservationStatus.RESERVED);
                
            if (alreadyReserved) {
                logger.warn("Inventory for order {} with transactionId {} was already reserved. Skipping duplicate reservation.", 
                    request.getOrderId(), request.getTransactionId());
                
                // Send reserved event to acknowledge the duplicate request
                InventoryReservedEvent event = InventoryReservedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .build();
                producer.sendInventoryEvent(event);
                return;
            }
            
            // Log các item để debug
            if (request.getItems() != null) {
                logger.debug("Request items: {}", request.getItems().size());
                for (int i = 0; i < request.getItems().size(); i++) {
                    logger.debug("Item {}: productId={}, color='{}', quantity={}", 
                            i+1, 
                            request.getItems().get(i).getProductId(),
                            request.getItems().get(i).getColor(),
                            request.getItems().get(i).getQuantity());
                }
            }
            
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
            // Add check for duplicate transaction processing to prevent infinite loops
            logger.info("Processing confirm inventory request for order: {} with transactionId: {}", request.getOrderId(), request.getTransactionId());
            
            // Check if this transaction was already processed by looking at the inventory history
            List<InventoryReservation> reservations = inventoryService.getReservationsByOrderId(request.getOrderId());
            
            if (reservations.isEmpty()) {
                logger.warn("Không tìm thấy reservation cho order ID: {}. Đơn hàng có thể đã bị hủy hoặc xử lý trước đó.", 
                           request.getOrderId());
                
                // Vẫn gửi event confirmed để flow có thể tiếp tục
                InventoryConfirmedEvent event = InventoryConfirmedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .build();
                producer.sendInventoryEvent(event);
                logger.info("Sent confirmation event despite no reservations found for order {}", request.getOrderId());
                return;
            }
            
            boolean alreadyConfirmed = reservations.stream()
                .anyMatch(res -> res.getStatus() == InventoryReservation.ReservationStatus.CONFIRMED);
                
            if (alreadyConfirmed) {
                logger.warn("Inventory for order {} with transactionId {} was already confirmed. Skipping duplicate confirmation request.", 
                    request.getOrderId(), request.getTransactionId());
                
                // Vẫn gửi event confirmed để flow có thể tiếp tục
                InventoryConfirmedEvent event = InventoryConfirmedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .build();
                producer.sendInventoryEvent(event);
                logger.info("Sent confirmation event for already confirmed order {}", request.getOrderId());
                return;
            }
            
            // Xử lý với retry logic
            int maxRetries = 3;
            int retryCount = 0;
            boolean success = false;
            Exception lastException = null;
            
            while (retryCount < maxRetries && !success) {
                try {
                    inventoryService.confirmReservation(request);
                    success = true;
                    logger.info("Successfully confirmed inventory for order {}, attempt {}/{}", 
                              request.getOrderId(), retryCount + 1, maxRetries);
                } catch (Exception e) {
                    lastException = e;
                    logger.warn("Error confirming reservation on attempt {}/{} for order {}: {}", 
                              retryCount + 1, maxRetries, request.getOrderId(), e.getMessage());
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
                InventoryConfirmedEvent event = InventoryConfirmedEvent.builder()
                        .transactionId(request.getTransactionId())
                        .orderId(request.getOrderId())
                        .items(request.getItems())
                        .build();
                producer.sendInventoryEvent(event);
                logger.info("Confirmed inventory for order {}", request.getOrderId());
            } else {
                logger.error("Failed to confirm inventory for order {} after {} attempts: {}", 
                          request.getOrderId(), retryCount, lastException != null ? lastException.getMessage() : "Unknown error");
                
                if (lastException != null) {
                    throw new RuntimeException("Failed to process confirm inventory request after " + 
                                             retryCount + " attempts", lastException);
                }
            }
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
            
            // Không throw exception để tránh lỗi khi xử lý message
        }
    }

    private void handleCancelInventoryRequest(CancelInventoryReservationRequest request) {
        try {
            logger.info("Processing cancel inventory request for order: {}", request.getOrderId());
            
            // Check if we already processed this cancellation to avoid duplicates
            List<InventoryReservation> reservations = inventoryService.getReservationsByOrderId(request.getOrderId());
            boolean alreadyCancelled = reservations.stream()
                .allMatch(res -> res.getStatus() == InventoryReservation.ReservationStatus.CANCELLED);
                
            if (alreadyCancelled) {
                logger.warn("Inventory for order {} was already cancelled. Skipping duplicate cancellation.", 
                    request.getOrderId());
                return;
            }
            
            // Process the cancellation with retries
            int maxRetries = 3;
            int retryCount = 0;
            boolean success = false;
            Exception lastException = null;
            
            while (retryCount < maxRetries && !success) {
                try {
                    inventoryService.cancelReservation(request);
                    success = true;
                    logger.info("Successfully cancelled inventory reservation for order {}, attempt {}/{}", 
                              request.getOrderId(), retryCount + 1, maxRetries);
                } catch (Exception e) {
                    lastException = e;
                    logger.warn("Error cancelling reservation on attempt {}/{} for order {}: {}", 
                              retryCount + 1, maxRetries, request.getOrderId(), e.getMessage());
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
            
            if (!success && lastException != null) {
                logger.error("Failed to cancel inventory for order {} after {} attempts: {}", 
                          request.getOrderId(), retryCount, lastException.getMessage(), lastException);
                throw new RuntimeException("Failed to process cancel inventory request after " + 
                                         retryCount + " attempts", lastException);
            }
        } catch (Exception e) {
            logger.error("Failed to cancel inventory for order {}: {}", request.getOrderId(), e.getMessage(), e);
            
            // Still acknowledge message (done at caller level) but log the error
            // We don't want to lose the error but also don't want to block the Kafka consumer
        }
    }

    private void handleCancelInventoryTopic(String topic, Object payload) {
        try {
            logger.info("Processing cancel-inventory-reservation message: {}", payload);
            
            CancelInventoryReservationRequest request;
            
            if (payload instanceof CancelInventoryReservationRequest) {
                request = (CancelInventoryReservationRequest) payload;
            } else if (payload instanceof Map) {
                Map<String, Object> map = (Map<String, Object>) payload;
                
                // Extract orderId and transactionId from map
                String orderId = map.containsKey("orderId") ? map.get("orderId").toString() : null;
                String transactionId = map.containsKey("transactionId") ? map.get("transactionId").toString() : UUID.randomUUID().toString();
                
                if (orderId == null) {
                    logger.error("Cancel inventory request missing orderId: {}", map);
                    throw new IllegalArgumentException("orderId is required for cancel inventory request");
                }
                
                request = CancelInventoryReservationRequest.builder()
                    .orderId(orderId)
                    .transactionId(transactionId)
                    .build();
                
                logger.info("Created CancelInventoryReservationRequest from map: {}", request);
            } else if (payload instanceof String) {
                // Try to parse as JSON
                try {
                    request = objectMapper.readValue((String) payload, CancelInventoryReservationRequest.class);
                } catch (Exception e) {
                    logger.error("Failed to parse string payload as CancelInventoryReservationRequest: {}", e.getMessage());
                    throw e;
                }
            } else {
                logger.error("Unsupported payload type for cancel-inventory-reservation: {}", 
                           payload != null ? payload.getClass().getName() : "null");
                throw new IllegalArgumentException("Unsupported payload type for cancel-inventory-reservation");
            }
            
            // Process the cancellation
            handleCancelInventoryRequest(request);
            
        } catch (Exception e) {
            logger.error("Error handling cancel-inventory-reservation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process cancel-inventory-reservation", e);
        }
    }

    private ReserveInventoryRequest convertMapToReserveRequest(Map<String, Object> map) {
        try {
            // Extract basic fields
            String transactionId = map.containsKey("transactionId") ? map.get("transactionId").toString() : UUID.randomUUID().toString();
            String orderId = map.containsKey("orderId") ? map.get("orderId").toString() : null;
            
            if (orderId == null) {
                throw new IllegalArgumentException("orderId is required");
            }
            
            // Handle items
            List<CartItemResponse> items = new ArrayList<>();
            if (map.containsKey("items") && map.get("items") instanceof List) {
                List<?> itemsList = (List<?>) map.get("items");
                for (Object item : itemsList) {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        CartItemResponse cartItem = new CartItemResponse();
                        
                        if (itemMap.containsKey("productId")) cartItem.setProductId(itemMap.get("productId").toString());
                        if (itemMap.containsKey("productName")) cartItem.setProductName(itemMap.get("productName").toString());
                        if (itemMap.containsKey("price")) cartItem.setPrice(Integer.parseInt(itemMap.get("price").toString()));
                        if (itemMap.containsKey("quantity")) cartItem.setQuantity(Integer.parseInt(itemMap.get("quantity").toString()));
                        if (itemMap.containsKey("color")) cartItem.setColor(itemMap.get("color").toString());
                        
                        items.add(cartItem);
                    }
                }
            }
            
            // Create request
            ReserveInventoryRequest request = new ReserveInventoryRequest();
            request.setTransactionId(transactionId);
            request.setOrderId(orderId);
            request.setItems(items);
            
            // Handle expiration if present
            if (map.containsKey("reservationExpiresAt")) {
                Object expiresAtObj = map.get("reservationExpiresAt");
                if (expiresAtObj instanceof String) {
                    request.setReservationExpiresAt(LocalDateTime.parse((String) expiresAtObj));
                }
            }
            
            return request;
        } catch (Exception e) {
            logger.error("Failed to convert map to ReserveInventoryRequest: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert map to ReserveInventoryRequest", e);
        }
    }
    
    private ConfirmInventoryReservationRequest convertMapToConfirmRequest(Map<String, Object> map) {
        try {
            // Extract basic fields
            String transactionId = map.containsKey("transactionId") ? map.get("transactionId").toString() : UUID.randomUUID().toString();
            String orderId = map.containsKey("orderId") ? map.get("orderId").toString() : null;
            
            if (orderId == null) {
                throw new IllegalArgumentException("orderId is required");
            }
            
            // Handle items
            List<CartItemResponse> items = new ArrayList<>();
            if (map.containsKey("items") && map.get("items") instanceof List) {
                List<?> itemsList = (List<?>) map.get("items");
                for (Object item : itemsList) {
                    if (item instanceof Map) {
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        CartItemResponse cartItem = new CartItemResponse();
                        
                        if (itemMap.containsKey("productId")) cartItem.setProductId(itemMap.get("productId").toString());
                        if (itemMap.containsKey("productName")) cartItem.setProductName(itemMap.get("productName").toString());
                        if (itemMap.containsKey("price")) cartItem.setPrice(Integer.parseInt(itemMap.get("price").toString()));
                        if (itemMap.containsKey("quantity")) cartItem.setQuantity(Integer.parseInt(itemMap.get("quantity").toString()));
                        if (itemMap.containsKey("color")) cartItem.setColor(itemMap.get("color").toString());
                        
                        items.add(cartItem);
                    }
                }
            }
            
            // Create request
            ConfirmInventoryReservationRequest request = new ConfirmInventoryReservationRequest();
            request.setTransactionId(transactionId);
            request.setOrderId(orderId);
            request.setItems(items);
            
            return request;
        } catch (Exception e) {
            logger.error("Failed to convert map to ConfirmInventoryReservationRequest: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert map to ConfirmInventoryReservationRequest", e);
        }
    }
}