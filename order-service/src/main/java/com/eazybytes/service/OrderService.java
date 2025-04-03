package com.eazybytes.service;

import com.eazybytes.model.Order;
import com.eazybytes.dto.CartDetailsResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    Order createOrder(String userId, String shippingAddress) throws Exception;
    Order getOrderById(UUID orderId);
    List<Order> getOrdersByUserId(String userId);
    void cancelOrder(UUID orderId);
    void confirmOrder(UUID orderId);
}