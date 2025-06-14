package com.eazybytes.controller;

import com.eazybytes.dto.OrderResponse;
import com.eazybytes.model.Order;
import com.eazybytes.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.OrderDetailsResponseDto;
import com.eazybytes.dto.UserPurchaseHistoryResponseDto;
import com.eazybytes.security.RoleChecker;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class OrderController {

    private final OrderService orderService;
    private final RoleChecker roleChecker;

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        try {
            log.info("Received request to get order with ID: {}", orderId);
            Order order = orderService.getOrderById(orderId);
            OrderResponse orderResponse = toOrderResponse(order);
            return new ResponseEntity<>(orderResponse, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get order with ID: {}. Reason: {}", orderId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(@PathVariable String userId) {
        try {
            log.info("Received request to get orders for user: {}", userId);
            List<Order> orders = orderService.getOrdersByUserId(userId);
            List<OrderResponse> orderResponses = orders.stream()
                    .map(this::toOrderResponse)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(orderResponses, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get orders for user: {}. Reason: {}", userId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/purchase-history")
    @PreAuthorize("@roleChecker.hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getUserPurchaseHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        String userId = null;
        try {
            userId = roleChecker.getCurrentUserId();
            log.info("Received request to get purchase history for user: {} with status filter: {}", userId, status);
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                       Sort.by(sortBy).descending() : 
                       Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<UserPurchaseHistoryResponseDto> purchaseHistory = orderService.getUserPurchaseHistory(userId, pageable, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orders", purchaseHistory.getContent());
            response.put("totalPages", purchaseHistory.getTotalPages());
            response.put("totalElements", purchaseHistory.getTotalElements());
            response.put("currentPage", page);
            response.put("size", size);
            response.put("hasNext", purchaseHistory.hasNext());
            response.put("hasPrevious", purchaseHistory.hasPrevious());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get purchase history for user: {}. Reason: {}", userId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<OrderDetailsResponseDto> getOrderByTransactionId(@PathVariable String transactionId) {
        try {
            log.info("Received request to get order by transaction ID: {}", transactionId);
            Order order = orderService.getOrderByTransactionId(transactionId);

            OrderDetailsResponseDto responseDto = convertToOrderDetailsResponseDto(order);
            return new ResponseEntity<>(responseDto, HttpStatus.OK);

        } catch (RuntimeException e) {
            log.warn("Error fetching order by transaction ID: {}. Reason: {}", transactionId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        try {
            log.info("Received request to cancel order with ID: {}", orderId);
            orderService.cancelOrder(orderId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            log.error("Failed to cancel order with ID: {}. Reason: {}", orderId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<Void> confirmOrder(@PathVariable Long orderId) {
        try {
            log.info("Received request to confirm order with ID: {}", orderId);
            orderService.confirmOrder(orderId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to confirm order with ID: {}. Reason: {}", orderId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Map<String, Object>> getAllOrdersForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String transactionId) {
        try {
            log.info("Admin request: getting all orders with filters - page: {}, size: {}, status: {}, userId: {}", 
                    page, size, status, userId);

            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                       Sort.by(sortBy).descending() : 
                       Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Order> orderPage = orderService.getAllOrdersForAdmin(pageable, status, userId, transactionId);
            
            List<OrderResponse> orderResponses = orderPage.getContent().stream()
                    .map(this::toOrderResponseWithDetails)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("orders", orderResponses);
            response.put("totalPages", orderPage.getTotalPages());
            response.put("totalElements", orderPage.getTotalElements());
            response.put("currentPage", page);
            response.put("size", size);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get orders for admin. Reason: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestParam String status) {
        try {
            log.info("Admin request: updating order {} status to {}", orderId, status);
            orderService.updateOrderStatus(orderId, status);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to update order status for ID: {}. Reason: {}", orderId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/admin/{orderId}/details")
    public ResponseEntity<OrderDetailsResponseDto> getOrderDetailsForAdmin(@PathVariable Long orderId) {
        try {
            log.info("Admin request: getting order details for ID: {}", orderId);
            Order order = orderService.getOrderByIdWithItems(orderId);
            OrderDetailsResponseDto responseDto = convertToOrderDetailsResponseDto(order);
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get order details for admin with ID: {}. Reason: {}", orderId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/admin/statistics")
    public ResponseEntity<Map<String, Object>> getOrderStatistics() {
        try {
            log.info("Admin request: getting order statistics");
            Map<String, Object> statistics = orderService.getOrderStatistics();
            return new ResponseEntity<>(statistics, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get order statistics. Reason: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Kiểm tra user đã mua sản phẩm chưa (cho review service)
     */
    @GetMapping("/check-purchased")
    public ResponseEntity<Boolean> checkIfUserPurchasedProduct(
            @RequestParam String userId, 
            @RequestParam String productId) {
        try {
            log.info("Checking if user {} purchased product {}", userId, productId);
            boolean hasPurchased = orderService.checkIfUserPurchasedProduct(userId, productId);
            return new ResponseEntity<>(hasPurchased, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to check purchase status for user {} and product {}. Reason: {}", 
                    userId, productId, e.getMessage());
            return new ResponseEntity<>(false, HttpStatus.OK); // Return false on error for safety
        }
    }

    @GetMapping("/user/purchased-items")
    public ResponseEntity<Map<String, Object>> getUserPurchasedItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = null;
        try {
            userId = roleChecker.getCurrentUserId();
            log.info("Received request to get purchased items for user: {}", userId);
            
            Sort sort = Sort.by("createdAt").descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Chỉ lấy các đơn hàng đã hoàn thành thanh toán
            Page<UserPurchaseHistoryResponseDto> purchaseHistory = orderService.getUserPurchaseHistory(
                userId, pageable, "PAYMENT_COMPLETED");
            
            // Flatten tất cả items từ các orders
            List<CartItemResponse> allPurchasedItems = purchaseHistory.getContent().stream()
                    .flatMap(order -> order.getItems().stream())
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("purchasedItems", allPurchasedItems);
            response.put("totalOrders", purchaseHistory.getTotalElements());
            response.put("totalPages", purchaseHistory.getTotalPages());
            response.put("currentPage", page);
            response.put("hasNext", purchaseHistory.hasNext());
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to get purchased items for user: {}. Reason: {}", userId, e.getMessage());
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private OrderResponse toOrderResponse(Order order) {
        return new OrderResponse(
                order.getId().toString(),
                order.getUserId(),
                order.getTotalAmount(),
                order.getStatus().name()
        );
    }

    private OrderResponse toOrderResponseWithDetails(Order order) {
        return new OrderResponse(
                order.getId().toString(),
                order.getUserId(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                order.getTransactionId(),
                order.getShippingAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getItems().size()
        );
    }

    private OrderDetailsResponseDto convertToOrderDetailsResponseDto(Order order) {
        List<CartItemResponse> itemDtos = order.getItems().stream()
                .map(item -> new CartItemResponse(
                        item.getProductId(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity(),
                        item.getColor(),
                        true // luôn true, hoặc thay đổi theo logic kiểm tra tồn kho nếu cần
                ))
                .collect(Collectors.toList());

        return new OrderDetailsResponseDto(
                order.getId().toString(),
                order.getTransactionId(),
                order.getUserId(),
                itemDtos,
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null,
                order.getStatus() != null ? order.getStatus().name() : null
        );
    }
}