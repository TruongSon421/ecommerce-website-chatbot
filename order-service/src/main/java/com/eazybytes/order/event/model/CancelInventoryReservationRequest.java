package com.eazybytes.order.event.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@NoArgsConstructor
@SuperBuilder
public class CancelInventoryReservationRequest {
    private String transactionId;
    private String orderId;
}