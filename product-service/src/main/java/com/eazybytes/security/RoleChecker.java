package com.eazybytes.security;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.List;

@Component
public class RoleChecker {

    public boolean hasRole(String requiredRole) {
        String rolesHeader = getHeader("X-Auth-Roles");
        if (rolesHeader == null) {
            return false;
        }
        List<String> roles = Arrays.asList(rolesHeader.split(","));
        return roles.contains("ROLE_" + requiredRole);
    }

    // Lấy userId từ header X-Auth-UserId
    public String getCurrentUserId() {
        String userId = getHeader("X-Auth-UserId");
        if (userId == null) {
            throw new IllegalStateException("User ID not found in request headers");
        }
        return userId;
    }

    // Lấy username từ header X-Auth-Username
    public String getCurrentUsername() {
        String username = getHeader("X-Auth-Username");
        if (username == null) {
            // Fallback to User-{userId} if username not found
            return "User-" + getCurrentUserId();
        }
        return username;
    }

    // Helper method để lấy header
    public String getHeader(String headerName) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attributes.getRequest().getHeader(headerName);
    }
}