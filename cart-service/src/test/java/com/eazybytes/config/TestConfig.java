package com.eazybytes.config;

import com.eazybytes.client.InventoryClient;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.event.CartEventProducer;
import com.eazybytes.repository.CartRedisRepository;
import com.eazybytes.security.RoleChecker;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public CartRedisRepository cartRedisRepository() {
        return Mockito.mock(CartRedisRepository.class);
    }

    @Bean
    @Primary
    public CartEventProducer cartEventProducer() {
        return Mockito.mock(CartEventProducer.class);
    }

    @Bean("testInventoryClient")
    @Primary
    public InventoryClient inventoryClient() {
        InventoryClient mock = Mockito.mock(InventoryClient.class);
        
        // Default mock behavior
        InventoryDto defaultInventory = new InventoryDto();
        defaultInventory.setProductId("default");
        defaultInventory.setProductName("Default Product");
        defaultInventory.setColor("default");
        defaultInventory.setQuantity(100);
        defaultInventory.setCurrentPrice(1000);
        
        Mockito.when(mock.getProductInventory(Mockito.anyString(), Mockito.anyString()))
               .thenReturn(org.springframework.http.ResponseEntity.ok(defaultInventory));
        
        return mock;
    }

    @Bean
    @Primary
    public RoleChecker roleChecker() {
        RoleChecker mock = Mockito.mock(RoleChecker.class);
        Mockito.when(mock.hasRole(Mockito.anyString())).thenReturn(true);
        Mockito.when(mock.getCurrentUserId()).thenReturn("testUser");
        return mock;
    }

    @Bean
    @Primary
    public CircuitBreakerFactory<?, ?> circuitBreakerFactory() {
        CircuitBreakerFactory<?, ?> factory = Mockito.mock(CircuitBreakerFactory.class);
        CircuitBreaker circuitBreaker = Mockito.mock(CircuitBreaker.class);
        
        Mockito.when(factory.create(Mockito.anyString())).thenReturn(circuitBreaker);
        
        // Default circuit breaker behavior - just execute the supplier
        Mockito.when(circuitBreaker.run(Mockito.any())).thenAnswer(invocation -> {
            Object supplier = invocation.getArgument(0);
            if (supplier instanceof java.util.function.Supplier) {
                return ((java.util.function.Supplier<?>) supplier).get();
            }
            return null;
        });
        
        return factory;
    }
} 