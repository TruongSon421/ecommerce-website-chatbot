package com.eazybytes.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor customHeadersInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes requestAttributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (requestAttributes != null) {
                // Forward the custom auth headers
                String roles = requestAttributes.getRequest().getHeader("X-Auth-Roles");
                String username = requestAttributes.getRequest().getHeader("X-Auth-Username");
                String userId = requestAttributes.getRequest().getHeader("X-Auth-UserId");

                if (roles != null) {
                    requestTemplate.header("X-Auth-Roles", roles);
                }
                if (username != null) {
                    requestTemplate.header("X-Auth-Username", username);
                }
                if (userId != null) {
                    requestTemplate.header("X-Auth-UserId", userId);
                }

                // Also forward any Bearer token if present
                String authHeader = requestAttributes.getRequest().getHeader("Authorization");
                if (authHeader != null) {
                    requestTemplate.header("Authorization", authHeader);
                }
            }
        };
    }
}