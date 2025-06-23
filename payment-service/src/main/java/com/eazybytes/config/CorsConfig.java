package com.eazybytes.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${NGROK_BASE_URL:https://api.truongson.shop}")
    private String ngrokBaseUrl;

    @Value("${FRONTEND_URL:https://dev.truongson.shop}")
    private String frontendUrl;

    @Value("${cors.additional-origins:http://localhost:8070,http://localhost:3000,https://dev.truongson.shop,https://api.truongson.shop}")
    private String additionalOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Build list of allowed origins dynamically
        List<String> allowedOrigins = Arrays.asList(
            ngrokBaseUrl,
            frontendUrl,
            "http://localhost:5173",
            "http://localhost:8070",
            "http://localhost:3000"
        );

        // Add additional origins if configured
        if (additionalOrigins != null && !additionalOrigins.trim().isEmpty()) {
            String[] additional = additionalOrigins.split(",");
            for (String origin : additional) {
                if (!origin.trim().isEmpty() && !allowedOrigins.contains(origin.trim())) {
                    allowedOrigins.add(origin.trim());
                }
            }
        }

        registry.addMapping("/api/v1/payment/vnpay/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        // Also configure for all other endpoints
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Build list of allowed origins dynamically
        List<String> allowedOrigins = Arrays.asList(
            ngrokBaseUrl,
            frontendUrl,
            "http://localhost:5173",
            "http://localhost:8070",
            "http://localhost:3000",
            "https://dev.truongson.shop",
            "https://api.truongson.shop"
        );

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 