package com.eazybytes.service;

import com.eazybytes.event.model.*;
import com.eazybytes.model.Order;
import com.eazybytes.dto.UserPurchaseHistoryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface OrderService {

    void processCheckoutInitiated(CheckoutInitiatedEvent event);

    void processInventoryReserved(InventoryReservedEvent event);

    void processInventoryReservationFailed(InventoryReservationFailedEvent event);

    void processPaymentSucceeded(PaymentSucceededEvent event);

    void processPaymentFailed(PaymentFailedEvent event);

    void processOrderCompleted(OrderCompletedEvent event);

    void processCheckoutFailed(CheckoutFailedEvent event);

    Order getOrderById(Long orderId);

    Order getOrderByIdWithItems(Long orderId);

    Order getOrderByTransactionId(String transactionId);

    List<Order> getOrdersByUserId(String userId);

    void cancelOrder(Long orderId);

    void confirmOrder(Long orderId);

    // New admin methods
    Page<Order> getAllOrdersForAdmin(Pageable pageable, String status, String userId, String transactionId);

    void updateOrderStatus(Long orderId, String status);

    Map<String, Object> getOrderStatistics();

    // Check if user purchased a product (for review system)
    boolean checkIfUserPurchasedProduct(String userId, String productId);

    // Get user purchase history with pagination and filtering
    Page<UserPurchaseHistoryResponseDto> getUserPurchaseHistory(String userId, Pageable pageable, String status);
}