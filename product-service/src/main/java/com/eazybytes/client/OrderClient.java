package com.eazybytes.client;

import com.eazybytes.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service",
        url = "${order-service.url}",
        configuration = FeignClientConfig.class)
public interface OrderClient {
    
    @GetMapping("/api/orders/check-purchased")
    boolean checkIfUserPurchasedProduct(@RequestParam("userId") String userId, 
                                      @RequestParam("productId") String productId,
                                      @RequestParam("color") String color);
} 