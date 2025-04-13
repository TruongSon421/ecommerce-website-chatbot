package com.eazybytes.order.controller;

import com.eazybytes.order.dto.OrderResponse;
import com.eazybytes.order.model.Order;
import com.eazybytes.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;


    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID orderId) {
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

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID orderId) {
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
    public ResponseEntity<Void> confirmOrder(@PathVariable UUID orderId) {
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
}