package com.eazybytes.service.client;

import com.eazybytes.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class InventoryServiceClient implements InventoryService {

    private final RestTemplate restTemplate;
    private final String inventoryServiceUrl;

    public InventoryServiceClient(RestTemplate restTemplate,
                                  @Value("${app.services.inventory.url}") String inventoryServiceUrl) {
        this.restTemplate = restTemplate;
        this.inventoryServiceUrl = inventoryServiceUrl;
    }

    @Override
    public boolean isPhoneAvailable(String phoneId, String color, int quantity) {
        String url = inventoryServiceUrl + "/phone/{phoneId}/{color}/available?quantity={quantity}";
        return Boolean.TRUE.equals(restTemplate.getForObject(
                url,
                Boolean.class,
                phoneId,
                color,
                quantity
        ));
    }

    @Override
    public boolean isLaptopAvailable(String laptopId, String color, int quantity) {
        String url = inventoryServiceUrl + "/laptop/{laptopId}/{color}/available?quantity={quantity}";
        return Boolean.TRUE.equals(restTemplate.getForObject(
                url,
                Boolean.class,
                laptopId,
                color,
                quantity
        ));
    }

    @Override
    public void decreasePhoneQuantity(String phoneId, String color, int quantity) {
        String url = inventoryServiceUrl + "/phone/decrease?phoneId={phoneId}&color={color}&quantity={quantity}";
        restTemplate.postForObject(url, null, Void.class, phoneId, color, quantity);
    }

    @Override
    public void decreaseLaptopQuantity(String laptopId, String color, int quantity) {
        String url = inventoryServiceUrl + "/laptop/decrease?laptopId={laptopId}&color={color}&quantity={quantity}";
        restTemplate.postForObject(url, null, Void.class, laptopId, color, quantity);
    }

    @Override
    public void increasePhoneQuantity(String phoneId, String color, int quantity) {
        String url = inventoryServiceUrl + "/phone/increase?phoneId={phoneId}&color={color}&quantity={quantity}";
        restTemplate.postForObject(url, null, Void.class, phoneId, color, quantity);
    }

    @Override
    public void increaseLaptopQuantity(String laptopId, String color, int quantity) {
        String url = inventoryServiceUrl + "/laptop/increase?laptopId={laptopId}&color={color}&quantity={quantity}";
        restTemplate.postForObject(url, null, Void.class, laptopId, color, quantity);
    }
}