package com.eazybytes.service;

public interface InventoryService {
    boolean isPhoneAvailable(String phoneId, String color, int quantity);

    boolean isLaptopAvailable(String laptopId, String color, int quantity);

    void decreasePhoneQuantity(String phoneId, String color, int quantity);

    void decreaseLaptopQuantity(String laptopId, String color, int quantity);

    void increasePhoneQuantity(String phoneId, String color, int quantity);

    void increaseLaptopQuantity(String laptopId, String color, int quantity);
}