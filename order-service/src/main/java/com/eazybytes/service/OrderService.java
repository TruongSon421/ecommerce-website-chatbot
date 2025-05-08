package com.eazybytes.service;

import com.eazybytes.event.model.*;
import com.eazybytes.model.Order;

import java.util.List;

public interface OrderService {

    void processCheckoutInitiated(CheckoutInitiatedEvent event);

    void processInventoryReserved(InventoryReservedEvent event);

    void processInventoryReservationFailed(InventoryReservationFailedEvent event);

    void processPaymentSucceeded(PaymentSucceededEvent event);

    void processPaymentFailed(PaymentFailedEvent event);

    void processOrderCompleted(OrderCompletedEvent event);

    void processCheckoutFailed(CheckoutFailedEvent event);

    Order getOrderById(Long orderId);

    List<Order> getOrdersByUserId(String userId);

    void cancelOrder(Long orderId);

    void confirmOrder(Long orderId);
}