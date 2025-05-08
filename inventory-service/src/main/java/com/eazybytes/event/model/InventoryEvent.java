package com.eazybytes.event.model;

public interface InventoryEvent {
    String getTransactionId();
    String getOrderId();
}