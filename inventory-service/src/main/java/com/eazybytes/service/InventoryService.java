package com.eazybytes.service;

import com.eazybytes.dto.CancelInventoryReservationRequest;
import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.ConfirmInventoryReservationRequest;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.dto.ReserveInventoryRequest;
import com.eazybytes.exception.InventoryAlreadyExistsException;
import com.eazybytes.exception.InventoryNotFoundException;
import com.eazybytes.model.InventoryHistory;
import com.eazybytes.model.InventoryReservation;
import com.eazybytes.model.ProductInventory;
import com.eazybytes.repository.InventoryHistoryRepository;
import com.eazybytes.repository.InventoryReservationRepository;
import com.eazybytes.repository.ProductInventoryRepository;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class InventoryService {

    private final ProductInventoryRepository productInventoryRepository;
    private final InventoryReservationRepository reservationRepository;
    private final InventoryHistoryRepository historyRepository;

    // Phương thức helper để chuẩn hóa color
    private String normalizeColor(String color) {
        // Nếu đã là "default", giữ nguyên
        if ("default".equals(color)) {
            return color;
        }
        // Nếu null hoặc rỗng, chuyển thành "default"
        return (color == null || color.trim().isEmpty()) ? "default" : color;
    }

    public ProductInventory getProductInventory(String productId, String color) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        
        // Chuẩn hóa color
        String normalizedColor = normalizeColor(color);
        log.debug("Tìm sản phẩm với ID: {} và color: {} (chuẩn hóa: {})", productId, color, normalizedColor);

        // "default" là giá trị tượng trưng, chỉ tìm sản phẩm có color=null hoặc rỗng
        if (normalizedColor.equals("default")) {
            log.debug("Tìm sản phẩm không có màu (color=null hoặc rỗng) cho productId: {}", productId);
            // Tìm sản phẩm có color=null hoặc rỗng
            Optional<ProductInventory> nullColorInventory = productInventoryRepository.findByProductIdAndColorIsNullOrEmpty(productId);
            if (nullColorInventory.isPresent()) {
                ProductInventory inventory = nullColorInventory.get();
                log.debug("Đã tìm thấy phiên bản với color null/rỗng (color='{}') cho sản phẩm ID: {}, tồn kho: {}", 
                        inventory.getColor(), productId, inventory.getQuantity());
                return inventory;
            } else {
                log.debug("Không tìm thấy phiên bản với color null/rỗng cho productId: {}", productId);
            }
            
            // Nếu không tìm thấy sản phẩm có color=null/rỗng, tìm phiên bản đầu tiên
            List<ProductInventory> inventories = productInventoryRepository.findByProductId(productId);
            log.debug("Tìm thấy {} phiên bản của sản phẩm ID: {}", inventories.size(), productId);
            
            if (!inventories.isEmpty()) {
                ProductInventory firstInventory = inventories.get(0);
                log.debug("Trả về phiên bản đầu tiên với color: '{}', tồn kho: {}", 
                        firstInventory.getColor(), firstInventory.getQuantity());
                return firstInventory;
            } else {
                log.error("Không tìm thấy phiên bản nào của sản phẩm ID: {}", productId);
                throw new InventoryNotFoundException(
                        "Không tìm thấy tồn kho cho sản phẩm có ID: " + productId);
            }
        }

        // Tìm kiếm thông thường theo productId và color
        log.debug("Tìm sản phẩm với color cụ thể: '{}' cho productId: {}", normalizedColor, productId);
        Optional<ProductInventory> inventoryOptional = productInventoryRepository
                .findByProductIdAndColor(productId, normalizedColor);

        if (inventoryOptional.isPresent()) {
            ProductInventory inventory = inventoryOptional.get();
            log.debug("Đã tìm thấy phiên bản với color: '{}', tồn kho: {}", 
                    inventory.getColor(), inventory.getQuantity());
            return inventory;
        } else {
            log.error("Không tìm thấy phiên bản với productId: {} và color: '{}'", productId, normalizedColor);
            throw new InventoryNotFoundException(
                    "Không tìm thấy tồn kho cho sản phẩm có ID: " + productId +
                            " và màu: " + normalizedColor);
        }
    }

    @Transactional
    public ProductInventory createInventory(InventoryDto request) {
        log.debug("Creating product inventory for product ID: {} and color: {}",
                request.getProductId(), request.getColor());
                
        

        log.debug("Checking if inventory already exists");
        Optional<ProductInventory> existingInventory = productInventoryRepository
                .findByProductIdAndColor(request.getProductId(), request.getColor());

        log.debug("Existing inventory found: {}", existingInventory.isPresent());

        ProductInventory inventory;
        if (existingInventory.isPresent()) {
            log.debug("Inventory already exists: {}", existingInventory.get());
            throw new InventoryAlreadyExistsException(
                    "Tồn kho đã tồn tại cho sản phẩm với ID: " + request.getProductId() +
                            " và màu: " + request.getColor());
        } else {
            log.debug("Creating new inventory object");
            inventory = new ProductInventory();
            inventory.setProductId(request.getProductId());
            inventory.setColor(request.getColor());
        }

        log.debug("Setting inventory properties");
        inventory.setProductName(request.getProductName());
        inventory.setQuantity(request.getQuantity());
        inventory.setOriginalPrice(request.getOriginalPrice());
        inventory.setCurrentPrice(request.getCurrentPrice());

        log.debug("Saving inventory to database");
        ProductInventory savedInventory = productInventoryRepository.save(inventory);
        log.debug("₫ {}", savedInventory.getInventoryId());

        return savedInventory;
    }


    @Transactional
    public ProductInventory updateInventory(InventoryDto request) {
        // Chuẩn hóa color
        String normalizedColor = normalizeColor(request.getColor());
        
        Optional<ProductInventory> existingInventory = productInventoryRepository
                .findByProductIdAndColor(request.getProductId(), normalizedColor);

        ProductInventory inventory;

        if (existingInventory.isPresent()) {
            inventory = existingInventory.get();
        } else {
            inventory = new ProductInventory();
            inventory.setProductId(request.getProductId());
            inventory.setColor(normalizedColor);
        }
        inventory.setProductName(request.getProductName());
        inventory.setQuantity(request.getQuantity());
        inventory.setOriginalPrice(request.getOriginalPrice());
        inventory.setCurrentPrice(request.getCurrentPrice());

        return productInventoryRepository.save(inventory);
    }

    
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED, 
                   propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public ProductInventory decreaseProductQuantity(String phoneId, String color, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng giảm phải lớn hơn 0");
        }
        
        // Chuẩn hóa color
        String normalizedColor = normalizeColor(color);
        
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                ProductInventory inventory = productInventoryRepository
                        .findByProductIdAndColor(phoneId, normalizedColor)
                        .orElseThrow(() -> new InventoryNotFoundException(
                                "Không tìm thấy tồn kho cho điện thoại với ID: " + phoneId +
                                        " và màu: " + normalizedColor));

                if (inventory.getQuantity() < quantity) {
                    throw new IllegalArgumentException(
                            "Không đủ số lượng trong kho. Hiện có: " + inventory.getQuantity() +
                                    ", Yêu cầu: " + quantity);
                }

                inventory.setQuantity(inventory.getQuantity() - quantity);
                ProductInventory savedInventory = productInventoryRepository.save(inventory);
                
                log.info("Successfully decreased inventory for productId: {}, color: {}, quantity: -{}", 
                        phoneId, normalizedColor, quantity);
                
                return savedInventory;
                
            } catch (org.springframework.dao.OptimisticLockingFailureException e) {
                retryCount++;
                log.warn("Optimistic locking failure on attempt {} for decreasing inventory productId: {}, color: {}. Retrying...", 
                        retryCount, phoneId, normalizedColor);
                
                if (retryCount >= maxRetries) {
                    log.error("Max retry attempts ({}) reached for decreasing inventory productId: {}, color: {}", 
                            maxRetries, phoneId, normalizedColor);
                    throw new RuntimeException("Không thể cập nhật tồn kho do xung đột đồng thời. Vui lòng thử lại.", e);
                }
                
                // Delay tăng dần theo số lần retry
                try {
                    Thread.sleep(100 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Thread interrupted during retry", ie);
                }
            } catch (Exception e) {
                log.error("Error decreasing inventory for productId: {}, color: {}, quantity: {}: {}", 
                        phoneId, normalizedColor, quantity, e.getMessage(), e);
                throw e;
            }
        }
        
        throw new RuntimeException("Unexpected error: exceeded retry loop without success or exception");
    }

    /**
     * Tăng số lượng điện thoại với retry logic để xử lý optimistic locking
     */
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED, 
                   propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public ProductInventory increaseProductQuantity(String phoneId, String color, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng tăng phải lớn hơn 0");
        }
        
        // Chuẩn hóa color
        String normalizedColor = normalizeColor(color);
        
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                // Sử dụng native query để tránh optimistic locking conflicts
                int updatedRows = productInventoryRepository.increaseInventoryQuantity(phoneId, normalizedColor, quantity);
                
                if (updatedRows == 0) {
                    // Nếu không cập nhật được, có thể sản phẩm không tồn tại
                    throw new InventoryNotFoundException(
                            "Không tìm thấy tồn kho cho điện thoại với ID: " + phoneId +
                                    " và màu: " + normalizedColor);
                }
                
                log.info("Successfully increased inventory for productId: {}, color: {}, quantity: +{}", 
                        phoneId, normalizedColor, quantity);
                
                // Trả về entity đã được cập nhật
                return productInventoryRepository
                        .findByProductIdAndColor(phoneId, normalizedColor)
                        .orElseThrow(() -> new InventoryNotFoundException(
                                "Không tìm thấy tồn kho sau khi cập nhật cho điện thoại với ID: " + phoneId +
                                        " và màu: " + normalizedColor));
                        
            } catch (org.springframework.dao.OptimisticLockingFailureException e) {
                retryCount++;
                log.warn("Optimistic locking failure on attempt {} for productId: {}, color: {}. Retrying...", 
                        retryCount, phoneId, normalizedColor);
                
                if (retryCount >= maxRetries) {
                    log.error("Max retry attempts ({}) reached for increasing inventory productId: {}, color: {}", 
                            maxRetries, phoneId, normalizedColor);
                    throw new RuntimeException("Không thể cập nhật tồn kho do xung đột đồng thời. Vui lòng thử lại.", e);
                }
                
                // Delay tăng dần theo số lần retry
                try {
                    Thread.sleep(100 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Thread interrupted during retry", ie);
                }
            } catch (Exception e) {
                log.error("Error increasing inventory for productId: {}, color: {}, quantity: {}: {}", 
                        phoneId, normalizedColor, quantity, e.getMessage(), e);
                throw e;
            }
        }
        
        throw new RuntimeException("Unexpected error: exceeded retry loop without success or exception");
    }

    public List<InventoryDto> findAllColorVariantsByProductId(String productId) {
        List<ProductInventory> inventories = productInventoryRepository.findAllByProductId(productId);

        // Chuyển đổi từ entity thành DTO
        return inventories.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private InventoryDto mapToDto(ProductInventory inventory) {
        return InventoryDto.builder()
                .inventoryId(inventory.getInventoryId())
                .productId(inventory.getProductId())
                .productName(inventory.getProductName())
                .color(inventory.getColor())
                .quantity(inventory.getQuantity())
                .originalPrice(inventory.getOriginalPrice())
                .currentPrice(inventory.getCurrentPrice())
                .build();
    }

    @Transactional
    public void deleteAllByProductId(String productId) {

        productInventoryRepository.deleteAllByProductId(productId);
    }

    @Transactional
    public void deleteInventory(String productId, String color){
        // Chuẩn hóa color
        String normalizedColor = normalizeColor(color);
        productInventoryRepository.deleteByProductIdAndColor(productId, normalizedColor);
    }

    @Transactional(transactionManager = "transactionManager", isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED, 
                   propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void reserveInventory(ReserveInventoryRequest request) {
        log.debug("Reserving inventory for order ID: {}", request.getOrderId());

        try {
            // Kiểm tra số lượng tồn kho
            for (CartItemResponse item : request.getItems()) {
                // Chuẩn hóa color
                String normalizedColor = normalizeColor(item.getColor());
                log.debug("Kiểm tra tồn kho: productId={}, color={} (đã chuẩn hóa: {})", 
                        item.getProductId(), item.getColor(), normalizedColor);
                
                ProductInventory inventory = null;
                try {
                    if (normalizedColor.equals("default")) {
                        log.debug("Tìm sản phẩm color=null/empty cho productId: {}", item.getProductId());
                        Optional<ProductInventory> nullColorInventory = productInventoryRepository.findByProductIdAndColorIsNullOrEmpty(item.getProductId());
                        if (nullColorInventory.isPresent()) {
                            inventory = nullColorInventory.get();
                            log.debug("Đã tìm thấy sản phẩm với color=null/empty: {} (id: {})", inventory.getColor(), inventory.getInventoryId());
                        } else {
                            log.debug("Không tìm thấy sản phẩm với color=null/empty. Tìm sản phẩm đầu tiên.");
                            inventory = productInventoryRepository.findFirstByProductId(item.getProductId())
                                    .orElseThrow(() -> new InventoryNotFoundException(
                                            "Không tìm thấy tồn kho cho sản phẩm với ID: " + item.getProductId()));
                            log.debug("Đã tìm sản phẩm đầu tiên với color: {}", inventory.getColor());
                        }
                    } else {
                        log.debug("Tìm sản phẩm có color='{}'", normalizedColor);
                        inventory = productInventoryRepository
                                .findByProductIdAndColor(item.getProductId(), normalizedColor)
                                .orElseThrow(() -> new InventoryNotFoundException(
                                        "Không tìm thấy tồn kho cho sản phẩm với ID: " + item.getProductId() +
                                                " và màu: " + normalizedColor));
                        log.debug("Đã tìm thấy sản phẩm với color='{}', tồn kho: {}", normalizedColor, inventory.getQuantity());
                    }
                } catch (InventoryNotFoundException e) {
                    log.error("Không tìm thấy sản phẩm: {}", e.getMessage());
                    throw e;
                }

                if (inventory.getQuantity() < item.getQuantity()) {
                    log.error("Không đủ tồn kho: cần {} nhưng chỉ có {}", item.getQuantity(), inventory.getQuantity());
                    throw new IllegalArgumentException(
                            "Không đủ số lượng trong kho cho sản phẩm " + item.getProductId() +
                                    ". Hiện có: " + inventory.getQuantity() +
                                    ", Yêu cầu: " + item.getQuantity());
                }
                
                log.debug("Đủ tồn kho cho sản phẩm {}, color: {}, yêu cầu: {}, hiện có: {}", 
                        item.getProductId(), normalizedColor, item.getQuantity(), inventory.getQuantity());
            }

            // Giảm số lượng tồn kho và tạo reservation
            for (CartItemResponse item : request.getItems()) {
                // Chuẩn hóa color
                String normalizedColor = normalizeColor(item.getColor());
                log.debug("Giảm tồn kho: productId={}, color={} (chuẩn hóa: {})", 
                        item.getProductId(), item.getColor(), normalizedColor);
                
                // Tìm và cập nhật số lượng tồn kho
                ProductInventory inventory = null;
                
                if (normalizedColor.equals("default")) {
                    Optional<ProductInventory> nullColorInventory = productInventoryRepository.findByProductIdAndColorIsNullOrEmpty(item.getProductId());
                    if (nullColorInventory.isPresent()) {
                        inventory = nullColorInventory.get();
                    } else {
                        inventory = productInventoryRepository.findFirstByProductId(item.getProductId())
                                .orElseThrow(() -> new InventoryNotFoundException(
                                        "Không tìm thấy tồn kho cho sản phẩm với ID: " + item.getProductId()));
                    }
                } else {
                    inventory = productInventoryRepository
                            .findByProductIdAndColor(item.getProductId(), normalizedColor)
                            .orElseThrow(() -> new InventoryNotFoundException(
                                    "Không tìm thấy tồn kho cho sản phẩm với ID: " + item.getProductId() +
                                            " và màu: " + normalizedColor));
                }
                
                // Cập nhật số lượng 
                if (inventory.getQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Không đủ số lượng trong kho cho sản phẩm " + item.getProductId() +
                                    ". Hiện có: " + inventory.getQuantity() +
                                    ", Yêu cầu: " + item.getQuantity());
                }
                
                // Cập nhật trực tiếp thông qua native query để tránh vấn đề optimistic locking
                Integer newQuantity = inventory.getQuantity() - item.getQuantity();
                log.debug("Cập nhật tồn kho: productId={}, color={}, newQuantity={}", 
                        inventory.getProductId(), normalizedColor, newQuantity);
                        
                int updatedRows = productInventoryRepository.updateInventoryQuantity(
                    inventory.getProductId(), 
                    normalizedColor,
                    newQuantity
                );
                
                log.debug("Kết quả cập nhật: {} dòng bị ảnh hưởng", updatedRows);
                
                if (updatedRows == 0) {
                    log.error("Không cập nhật được tồn kho cho sản phẩm: {}, color: {}", 
                            inventory.getProductId(), normalizedColor);
                    throw new RuntimeException("Không thể cập nhật tồn kho cho sản phẩm: " + 
                            inventory.getProductId() + ", color: " + normalizedColor);
                }

                // Tạo reservation
                InventoryReservation reservation = InventoryReservation.builder()
                        .orderId(request.getOrderId())
                        .productId(item.getProductId())
                        .color(normalizedColor)
                        .quantity(item.getQuantity())
                        .status(InventoryReservation.ReservationStatus.RESERVED)
                        .expiresAt(request.getReservationExpiresAt() != null ? 
                                  request.getReservationExpiresAt() : 
                                  LocalDateTime.now().plusMinutes(10))
                        .build();
                reservationRepository.save(reservation);
                log.debug("Đã lưu reservation: orderId={}, productId={}, color={}, quantity={}", 
                        reservation.getOrderId(), reservation.getProductId(), 
                        reservation.getColor(), reservation.getQuantity());

                // Ghi lịch sử
                InventoryHistory history = InventoryHistory.builder()
                        .productId(item.getProductId())
                        .color(normalizedColor)
                        .quantityChange(-item.getQuantity())
                        .reason("RESERVED")
                        .orderId(request.getOrderId())
                        .build();
                historyRepository.save(history);
                log.debug("Đã lưu history: productId={}, color={}, quantityChange={}", 
                        history.getProductId(), history.getColor(), history.getQuantityChange());
            }
            
            log.info("Đã hoàn thành giữ hàng cho đơn hàng: {}", request.getOrderId());
        } catch (Exception e) {
            log.error("Error reserving inventory: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(transactionManager = "transactionManager")
    public void confirmReservation(ConfirmInventoryReservationRequest request) {
        log.debug("Confirming inventory reservation for order ID: {}", request.getOrderId());

        // Tìm các reservation cho order
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(request.getOrderId());
        if (reservations.isEmpty()) {
            log.warn("Không tìm thấy reservation cho order ID: {}. Có thể đã bị hủy hoặc xử lý trước đó.", request.getOrderId());
            return; // Chỉ return thay vì throw exception để tránh lỗi khi không tìm thấy reservation
        }

        // Kiểm tra items trong request khớp với reservations
        boolean allItemsValid = true;
        StringBuilder invalidItems = new StringBuilder();
        
        for (CartItemResponse item : request.getItems()) {
            // Chuẩn hóa color
            String normalizedColor = normalizeColor(item.getColor());
            
            boolean found = reservations.stream().anyMatch(reservation ->
                    reservation.getProductId().equals(item.getProductId()) &&
                            reservation.getColor().equals(normalizedColor) &&
                            reservation.getQuantity().equals(item.getQuantity()) &&
                            (reservation.getStatus() == InventoryReservation.ReservationStatus.RESERVED ||
                             reservation.getStatus() == InventoryReservation.ReservationStatus.CONFIRMED));

            if (!found) {
                allItemsValid = false;
                invalidItems.append("ProductId: ").append(item.getProductId())
                        .append(", Color: ").append(normalizedColor)
                        .append(", Quantity: ").append(item.getQuantity())
                        .append("; ");
            }
        }

        if (!allItemsValid) {
            log.warn("Một số sản phẩm không khớp với reservation cho order ID: {}. Chi tiết: {}", 
                    request.getOrderId(), invalidItems.toString());
            // Vẫn tiếp tục xử lý các sản phẩm hợp lệ thay vì throw exception
        }

        // Cập nhật trạng thái reservation và ghi lịch sử
        for (InventoryReservation reservation : reservations) {
            // Skip if already confirmed
            if (reservation.getStatus() == InventoryReservation.ReservationStatus.CONFIRMED) {
                log.debug("Reservation already confirmed for productId={}, color={}, orderId={}", 
                    reservation.getProductId(), reservation.getColor(), reservation.getOrderId());
                continue;
            }
            
            reservation.setStatus(InventoryReservation.ReservationStatus.CONFIRMED);
            reservationRepository.save(reservation);
            log.info("Updated reservation status to CONFIRMED for productId={}, orderId={}", 
                    reservation.getProductId(), reservation.getOrderId());

            InventoryHistory history = InventoryHistory.builder()
                    .productId(reservation.getProductId())
                    .color(reservation.getColor())
                    .quantityChange(-reservation.getQuantity())
                    .reason("CONFIRMED")
                    .orderId(reservation.getOrderId())
                    .build();
            historyRepository.save(history);
            log.info("Created inventory history record for confirmation");
        }
        
        log.info("Successfully completed confirmation of all reservations for order ID: {}", request.getOrderId());
    }

    @Transactional(transactionManager = "transactionManager", 
                   isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED,
                   propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void cancelReservation(CancelInventoryReservationRequest request) {
        log.debug("Cancelling inventory reservation for order ID: {}", request.getOrderId());

        // Tìm các reservation cho order
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(request.getOrderId());
        if (reservations.isEmpty()) {
            log.warn("Không tìm thấy reservation cho order ID: {}. Có thể đã được hủy trước đó.", request.getOrderId());
            return; // Chỉ return thay vì throw exception để tránh lỗi khi có nhiều request hủy cùng lúc
        }

        log.info("Found {} reservations for order: {}", reservations.size(), request.getOrderId());
        
        // Cập nhật trạng thái và khôi phục số lượng tồn kho
        for (InventoryReservation reservation : reservations) {
            int maxRetries = 3;
            int retryCount = 0;
            boolean success = false;
            
            while (retryCount < maxRetries && !success) {
                try {
                    // Chỉ cần khôi phục tồn kho cho các reservation có status là RESERVED
                    // Không cần khôi phục cho CONFIRMED (đã được xác nhận và thuộc đơn hàng hoàn thành)
                    // Không cần khôi phục cho CANCELLED (đã được khôi phục trước đó)
                    if (reservation.getStatus() == InventoryReservation.ReservationStatus.RESERVED) {
                        // Tăng số lượng trong ProductInventory
                        String normalizedColor = normalizeColor(reservation.getColor());
                        
                        log.info("Returning {} units of product {} (color: {}) to inventory on attempt {}/{}", 
                               reservation.getQuantity(), reservation.getProductId(), normalizedColor, retryCount + 1, maxRetries);
                        
                        increaseProductQuantity(reservation.getProductId(), normalizedColor, reservation.getQuantity());
                        log.info("Đã hoàn trả {} sản phẩm {} màu {} cho đơn hàng {} on attempt {}/{}", 
                                reservation.getQuantity(), reservation.getProductId(), normalizedColor, 
                                reservation.getOrderId(), retryCount + 1, maxRetries);
                        
                        // Cập nhật trạng thái
                        reservation.setStatus(InventoryReservation.ReservationStatus.CANCELLED);
                        reservationRepository.save(reservation);
                        log.info("Updated reservation status to CANCELLED for productId={}, orderId={}", 
                                reservation.getProductId(), reservation.getOrderId());

                        // Ghi lịch sử
                        InventoryHistory history = InventoryHistory.builder()
                                .productId(reservation.getProductId())
                                .color(normalizedColor)
                                .quantityChange(reservation.getQuantity())
                                .reason("CANCELLED")
                                .orderId(reservation.getOrderId())
                                .build();
                        historyRepository.save(history);
                        log.info("Created inventory history record for cancellation");
                        
                        success = true;
                    } else {
                        log.info("Reservation cho đơn hàng {} với sản phẩm {} đã ở trạng thái {}, không cần hoàn trả tồn kho", 
                                reservation.getOrderId(), reservation.getProductId(), reservation.getStatus());
                        success = true; // Không cần retry cho trường hợp này
                    }
                } catch (org.springframework.dao.OptimisticLockingFailureException e) {
                    retryCount++;
                    log.warn("Optimistic locking failure on attempt {} for cancelling reservation productId={} in order {}: {}", 
                            retryCount, reservation.getProductId(), request.getOrderId(), e.getMessage());
                    
                    if (retryCount >= maxRetries) {
                        log.error("Max retry attempts ({}) reached for cancelling reservation productId={} in order {}", 
                                maxRetries, reservation.getProductId(), request.getOrderId());
                        throw new RuntimeException("Failed to cancel reservation for productId=" + 
                                reservation.getProductId() + " in order " + request.getOrderId() + 
                                " after " + maxRetries + " attempts due to concurrent modifications", e);
                    }
                    
                    // Delay tăng dần theo số lần retry
                    try {
                        Thread.sleep(200 * retryCount);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Thread interrupted during retry", ie);
                    }
                } catch (Exception e) {
                    log.error("Error processing cancellation for productId={} in order {} on attempt {}/{}: {}", 
                            reservation.getProductId(), request.getOrderId(), retryCount + 1, maxRetries, e.getMessage(), e);
                    // Không retry cho các lỗi khác, throw ngay
                    throw new RuntimeException("Failed to cancel reservation for productId=" + 
                            reservation.getProductId() + " in order " + request.getOrderId(), e);
                }
            }
            
            if (!success) {
                throw new RuntimeException("Failed to cancel reservation for productId=" + 
                        reservation.getProductId() + " in order " + request.getOrderId() + 
                        " after " + maxRetries + " attempts");
            }
        }
        
        log.info("Successfully completed cancellation of all reservations for order ID: {}", request.getOrderId());
    }

    @Transactional
    public void saveHistory(InventoryHistory history) {
        historyRepository.save(history);
    }

    public List<CartItemResponse> getReservationItems(String orderId) {
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);
        return reservations.stream()
                .map(reservation -> {
                    String normalizedColor = normalizeColor(reservation.getColor());
                    ProductInventory inventory = productInventoryRepository
                            .findByProductIdAndColor(reservation.getProductId(), normalizedColor)
                            .orElseThrow(() -> new InventoryNotFoundException(
                                    "Không tìm thấy tồn kho cho sản phẩm với ID: " + reservation.getProductId() +
                                            " và màu: " + normalizedColor));
                    return new CartItemResponse(
                            reservation.getProductId(),
                            inventory.getProductName(),
                            inventory.getCurrentPrice(),
                            reservation.getQuantity(),
                            normalizedColor,
                            inventory.getQuantity() > 0
                    );
                })
                .collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds (1 minute)
    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public void cancelExpiredReservations() {
        log.debug("Checking for expired reservations");

        List<InventoryReservation> expiredReservations = reservationRepository.findByStatusAndExpiresAtBefore(
                InventoryReservation.ReservationStatus.RESERVED, LocalDateTime.now());
                
        if (!expiredReservations.isEmpty()) {
            log.info("Found {} expired reservations to process", expiredReservations.size());
        }

        for (InventoryReservation reservation : expiredReservations) {
            log.info("Cancelling expired reservation for order ID: {}, product: {}, color: {}, quantity: {}, expired at: {}", 
                    reservation.getOrderId(), reservation.getProductId(), 
                    reservation.getColor(), reservation.getQuantity(), 
                    reservation.getExpiresAt());

            int maxRetries = 3;
            int retryCount = 0;
            boolean success = false;
            
            while (retryCount < maxRetries && !success) {
                try {
                    // Restore inventory quantity
                    String normalizedColor = normalizeColor(reservation.getColor());
                    increaseProductQuantity(reservation.getProductId(), normalizedColor, reservation.getQuantity());
        
                    // Update reservation status
                    reservation.setStatus(InventoryReservation.ReservationStatus.CANCELLED);
                    reservationRepository.save(reservation);
        
                    // Log history
                    InventoryHistory history = InventoryHistory.builder()
                            .productId(reservation.getProductId())
                            .color(normalizedColor)
                            .quantityChange(reservation.getQuantity())
                            .reason("TIMEOUT")
                            .orderId(reservation.getOrderId())
                            .build();
                    historyRepository.save(history);
                    
                    log.info("Successfully restored {} units of product {} with color {} for expired order {} on attempt {}/{}", 
                            reservation.getQuantity(), reservation.getProductId(), 
                            normalizedColor, reservation.getOrderId(), retryCount + 1, maxRetries);
                    
                    success = true;
                } catch (org.springframework.dao.OptimisticLockingFailureException e) {
                    retryCount++;
                    log.warn("Optimistic locking failure on attempt {} for expired reservation (orderId: {}, productId: {}): {}", 
                            retryCount, reservation.getOrderId(), reservation.getProductId(), e.getMessage());
                    
                    if (retryCount >= maxRetries) {
                        log.error("Max retry attempts ({}) reached for expired reservation (orderId: {}, productId: {})", 
                                maxRetries, reservation.getOrderId(), reservation.getProductId());
                        break; // Continue với reservation tiếp theo thay vì throw exception
                    }
                    
                    try {
                        Thread.sleep(150 * retryCount);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } catch (Exception e) {
                    log.error("Error restoring inventory for expired reservation (orderId: {}, productId: {}) on attempt {}/{}: {}", 
                              reservation.getOrderId(), reservation.getProductId(), retryCount + 1, maxRetries, e.getMessage(), e);
                    break; // Continue với reservation tiếp theo thay vì retry
                }
            }
            
            if (!success) {
                log.error("Failed to restore inventory for expired reservation (orderId: {}, productId: {}) after {} attempts", 
                          reservation.getOrderId(), reservation.getProductId(), maxRetries);
            }
        }

        log.debug("Processed {} expired reservations", expiredReservations.size());
    }

    public List<InventoryReservation> getReservationsByOrderId(String orderId) {
        log.debug("Finding reservations for order ID: {}", orderId);
        return reservationRepository.findByOrderId(orderId);
    }
}