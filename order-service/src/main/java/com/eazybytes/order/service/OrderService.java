package com.eazybytes.order.service;

import com.eazybytes.order.event.model.*;
import com.eazybytes.order.model.Order;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    void processCheckoutInitiated(CheckoutInitiatedEvent event);

    void processInventoryReserved(InventoryReservedEvent event);

    void processInventoryReservationFailed(InventoryReservationFailedEvent event);

    void processPaymentSucceeded(PaymentSucceededEvent event);

    void processPaymentFailed(PaymentFailedEvent event);

    void processOrderCompleted(OrderCompletedEvent event);

    void processCheckoutFailed(CheckoutFailedEvent event);

    Order getOrderById(UUID orderId);

    List<Order> getOrdersByUserId(String userId);

    void cancelOrder(UUID orderId);

    void confirmOrder(UUID orderId);
}