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

    public ProductInventory getProductInventory(String productId, String color) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }

        Optional<ProductInventory> inventoryOptional = productInventoryRepository
                .findByProductIdAndColor(productId, color);

        if (!inventoryOptional.isPresent()) {
            throw new InventoryNotFoundException(
                    "Không tìm thấy tồn kho cho sản phẩm có ID: " + productId +
                            " và màu: " + color);
        }

        return inventoryOptional.get();
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
        Optional<ProductInventory> existingInventory = productInventoryRepository
                .findByProductIdAndColor(request.getProductId(), request.getColor());

        ProductInventory inventory;

        if (existingInventory.isPresent()) {
            inventory = existingInventory.get();
        } else {
            inventory = new ProductInventory();
            inventory.setProductId(request.getProductId());
            inventory.setColor(request.getColor());
        }
        inventory.setProductName(request.getProductName());
        inventory.setQuantity(request.getQuantity());
        inventory.setOriginalPrice(request.getOriginalPrice());
        inventory.setCurrentPrice(request.getCurrentPrice());

        return productInventoryRepository.save(inventory);
    }

    
    @Transactional
    public ProductInventory decreaseProductQuantity(String phoneId, String color, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng giảm phải lớn hơn 0");
        }

        ProductInventory inventory = productInventoryRepository
                .findByProductIdAndColor(phoneId, color)
                .orElseThrow(() -> new InventoryNotFoundException(
                        "Không tìm thấy tồn kho cho điện thoại với ID: " + phoneId +
                                " và màu: " + color));

        if (inventory.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Không đủ số lượng trong kho. Hiện có: " + inventory.getQuantity() +
                            ", Yêu cầu: " + quantity);
        }

        inventory.setQuantity(inventory.getQuantity() - quantity);
        return productInventoryRepository.save(inventory);
    }

    /**
     * Tăng số lượng điện thoại
     */
    @Transactional
    public ProductInventory increaseProductQuantity(String phoneId, String color, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng tăng phải lớn hơn 0");
        }

        ProductInventory inventory = productInventoryRepository
                .findByProductIdAndColor(phoneId, color)
                .orElseThrow(() -> new InventoryNotFoundException(
                        "Không tìm thấy tồn kho cho điện thoại với ID: " + phoneId +
                                " và màu: " + color));

        inventory.setQuantity(inventory.getQuantity() + quantity);
        return productInventoryRepository.save(inventory);
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
        productInventoryRepository.deleteByProductIdAndColor(productId,color);
    }

    @Transactional(transactionManager = "transactionManager", isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED, 
                   propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void reserveInventory(ReserveInventoryRequest request) {
        log.debug("Reserving inventory for order ID: {}", request.getOrderId());

        try {
            // Kiểm tra số lượng tồn kho
            for (CartItemResponse item : request.getItems()) {
                ProductInventory inventory = productInventoryRepository
                        .findByProductIdAndColor(item.getProductId(), item.getColor())
                        .orElseThrow(() -> new InventoryNotFoundException(
                                "Không tìm thấy tồn kho cho sản phẩm với ID: " + item.getProductId() +
                                        " và màu: " + item.getColor()));

                if (inventory.getQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Không đủ số lượng trong kho cho sản phẩm " + item.getProductId() +
                                    ". Hiện có: " + inventory.getQuantity() +
                                    ", Yêu cầu: " + item.getQuantity());
                }
            }

            // Giảm số lượng tồn kho và tạo reservation
            for (CartItemResponse item : request.getItems()) {
                // Tìm và cập nhật số lượng tồn kho
                ProductInventory inventory = productInventoryRepository
                        .findByProductIdAndColor(item.getProductId(), item.getColor())
                        .orElseThrow(() -> new InventoryNotFoundException(
                                "Không tìm thấy tồn kho cho sản phẩm với ID: " + item.getProductId() +
                                        " và màu: " + item.getColor()));
                
                // Cập nhật số lượng 
                if (inventory.getQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Không đủ số lượng trong kho cho sản phẩm " + item.getProductId() +
                                    ". Hiện có: " + inventory.getQuantity() +
                                    ", Yêu cầu: " + item.getQuantity());
                }
                
                // Cập nhật trực tiếp thông qua native query để tránh vấn đề optimistic locking
                Integer newQuantity = inventory.getQuantity() - item.getQuantity();
                productInventoryRepository.updateInventoryQuantity(
                    inventory.getProductId(), 
                    inventory.getColor(),
                    newQuantity
                );

                // Tạo reservation
                InventoryReservation reservation = InventoryReservation.builder()
                        .orderId(request.getOrderId())
                        .productId(item.getProductId())
                        .color(item.getColor())
                        .quantity(item.getQuantity())
                        .status(InventoryReservation.ReservationStatus.RESERVED)
                        .expiresAt(request.getReservationExpiresAt() != null ? 
                                  request.getReservationExpiresAt() : 
                                  LocalDateTime.now().plusMinutes(10))
                        .build();
                reservationRepository.save(reservation);

                // Ghi lịch sử
                InventoryHistory history = InventoryHistory.builder()
                        .productId(item.getProductId())
                        .color(item.getColor())
                        .quantityChange(-item.getQuantity())
                        .reason("RESERVED")
                        .orderId(request.getOrderId())
                        .build();
                historyRepository.save(history);
            }
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
            throw new IllegalArgumentException("Không tìm thấy reservation cho order ID: " + request.getOrderId());
        }

        // Kiểm tra items trong request khớp với reservations
        for (CartItemResponse item : request.getItems()) {
            boolean found = reservations.stream().anyMatch(reservation ->
                    reservation.getProductId().equals(item.getProductId()) &&
                            reservation.getColor().equals(item.getColor()) &&
                            reservation.getQuantity().equals(item.getQuantity()) &&
                            reservation.getStatus() == InventoryReservation.ReservationStatus.RESERVED);

            if (!found) {
                throw new IllegalArgumentException(
                        "Reservation không hợp lệ cho sản phẩm " + item.getProductId() +
                                " với màu " + item.getColor());
            }
        }

        // Cập nhật trạng thái reservation và ghi lịch sử
        for (InventoryReservation reservation : reservations) {
            reservation.setStatus(InventoryReservation.ReservationStatus.CONFIRMED);
            reservationRepository.save(reservation);

            InventoryHistory history = InventoryHistory.builder()
                    .productId(reservation.getProductId())
                    .color(reservation.getColor())
                    .quantityChange(-reservation.getQuantity())
                    .reason("CONFIRMED")
                    .orderId(reservation.getOrderId())
                    .build();
            historyRepository.save(history);
        }
    }

    @Transactional(transactionManager = "transactionManager")
    public void cancelReservation(CancelInventoryReservationRequest request) {
        log.debug("Cancelling inventory reservation for order ID: {}", request.getOrderId());

        // Tìm các reservation cho order
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(request.getOrderId());
        if (reservations.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy reservation cho order ID: " + request.getOrderId());
        }

        // Cập nhật trạng thái và khôi phục số lượng tồn kho
        for (InventoryReservation reservation : reservations) {
            if (reservation.getStatus() == InventoryReservation.ReservationStatus.RESERVED) {
                // Tăng số lượng trong ProductInventory
                increaseProductQuantity(reservation.getProductId(), reservation.getColor(), reservation.getQuantity());

                // Cập nhật trạng thái
                reservation.setStatus(InventoryReservation.ReservationStatus.CANCELLED);
                reservationRepository.save(reservation);

                // Ghi lịch sử
                InventoryHistory history = InventoryHistory.builder()
                        .productId(reservation.getProductId())
                        .color(reservation.getColor())
                        .quantityChange(reservation.getQuantity())
                        .reason("CANCELLED")
                        .orderId(reservation.getOrderId())
                        .build();
                historyRepository.save(history);
            }
        }
    }

    @Transactional
    public void saveHistory(InventoryHistory history) {
        historyRepository.save(history);
    }

    public List<CartItemResponse> getReservationItems(String orderId) {
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);
        return reservations.stream()
                .map(reservation -> {
                    ProductInventory inventory = productInventoryRepository
                            .findByProductIdAndColor(reservation.getProductId(), reservation.getColor())
                            .orElseThrow(() -> new InventoryNotFoundException(
                                    "Không tìm thấy tồn kho cho sản phẩm với ID: " + reservation.getProductId() +
                                            " và màu: " + reservation.getColor()));
                    return new CartItemResponse(
                            reservation.getProductId(),
                            inventory.getProductName(),
                            inventory.getCurrentPrice(),
                            reservation.getQuantity(),
                            reservation.getColor(),
                            inventory.getQuantity() > 0
                    );
                })
                .collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds (1 minute)
    @Transactional
    public void cancelExpiredReservations() {
        log.debug("Checking for expired reservations");

        List<InventoryReservation> expiredReservations = reservationRepository.findByStatusAndExpiresAtBefore(
                InventoryReservation.ReservationStatus.RESERVED, LocalDateTime.now());

        for (InventoryReservation reservation : expiredReservations) {
            log.info("Cancelling expired reservation for order ID: {}", reservation.getOrderId());

            // Restore inventory quantity
            increaseProductQuantity(reservation.getProductId(), reservation.getColor(), reservation.getQuantity());

            // Update reservation status
            reservation.setStatus(InventoryReservation.ReservationStatus.CANCELLED);
            reservationRepository.save(reservation);

            // Log history
            InventoryHistory history = InventoryHistory.builder()
                    .productId(reservation.getProductId())
                    .color(reservation.getColor())
                    .quantityChange(reservation.getQuantity())
                    .reason("TIMEOUT")
                    .orderId(reservation.getOrderId())
                    .build();
            historyRepository.save(history);
        }

        log.debug("Processed {} expired reservations", expiredReservations.size());
    }
}