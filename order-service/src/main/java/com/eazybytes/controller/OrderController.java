package com.eazybytes.controller;

import com.eazybytes.dto.OrderResponse;
import com.eazybytes.model.Order;
import com.eazybytes.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.stream.Collectors;

import com.eazybytes.dto.CartItemResponse;
import com.eazybytes.dto.OrderDetailsResponseDto;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;


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

    private OrderResponse toOrderResponse(Order order) {
        return new OrderResponse(
                order.getId().toString(),
                order.getUserId(),
                order.getTotalAmount(),
                order.getStatus().name()
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