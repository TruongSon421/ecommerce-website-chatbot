package com.eazybytes.repository;

import com.eazybytes.model.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    /**
     * Find all reservations for a given order ID.
     */
    List<InventoryReservation> findByOrderId(String orderId);
    List<InventoryReservation> findByStatusAndExpiresAtBefore(
               InventoryReservation.ReservationStatus status, LocalDateTime expiresAt);
}