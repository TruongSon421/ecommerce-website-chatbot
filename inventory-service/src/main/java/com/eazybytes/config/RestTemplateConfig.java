package com.eazybytes.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // Method 1: Using RestTemplateBuilder (for newer Spring Boot versions)
        try {
            return builder
                    .setConnectTimeout(java.time.Duration.ofMillis(30000))
                    .setReadTimeout(java.time.Duration.ofMillis(60000))
                    .build();
        } catch (NoSuchMethodError e) {
            // Method 2: Fallback for older Spring Boot versions
            return createRestTemplateWithTimeouts();
        }
    }
    
    private RestTemplate createRestTemplateWithTimeouts() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30 seconds
        factory.setReadTimeout(60000);    // 60 seconds
        
        return new RestTemplate(factory);
    }
}