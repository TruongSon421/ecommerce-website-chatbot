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

    public boolean hasAccessToUserId(String userId) {
        String currentUserId = getHeader("X-Auth-UserId");
        if (currentUserId == null) {
            return false;
        }
        return currentUserId.equals(userId);
    }

    // Helper method để lấy header
    private String getHeader(String headerName) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attributes.getRequest().getHeader(headerName);
    }
}