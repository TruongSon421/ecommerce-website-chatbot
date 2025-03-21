package com.eazybytes.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouterValidator {
    public static final List<String> openApiEndpoints = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh-token",

            "/api/products/type/{type}",
            "/api/products/getPhone/{id}",
            "/api/products/getLaptop/{id}",
            "/api/products/search",

            "/api/inventory/product",
            "/api/inventory/productColorVariants/{productId}",
            "/api/inventory/related/{productId}",
            "/api/group-variants/groups",
            "/api/group-variants/search"
            );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> matchPath(request.getURI().getPath(), uri));

    private boolean matchPath(String requestPath, String pattern) {
        boolean hasPathVariable = pattern.contains("{") && pattern.contains("}");

        if (!hasPathVariable) {
            return requestPath.equals(pattern);
        }

        // Trường hợp có biến đường dẫn
        String[] requestParts = requestPath.split("/");
        String[] patternParts = pattern.split("/");

        if (requestParts.length != patternParts.length) {
            return false;
        }

        for (int i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith("{") && patternParts[i].endsWith("}")) {
                continue;
            }
            if (!patternParts[i].equals(requestParts[i])) {
                return false;
            }
        }
        return true;
    }
}