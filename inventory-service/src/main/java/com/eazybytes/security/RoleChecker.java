package com.eazybytes.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class RoleChecker {
    public boolean hasRole(String requiredRole) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attributes.getRequest();
            String rolesHeader = request.getHeader("X-Auth-Roles");
            
            if (rolesHeader == null || rolesHeader.trim().isEmpty()) {
                return false; // Return false instead of throwing exception
            }
            
            List<String> roles = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .filter(role -> !role.isEmpty())
                    .collect(Collectors.toList());
            
            String expectedRole = "ROLE_" + requiredRole;
            return roles.contains(expectedRole); // Return boolean result
            
        } catch (IllegalStateException e) {
            return false; // Return false instead of throwing exception
        }
    }
}