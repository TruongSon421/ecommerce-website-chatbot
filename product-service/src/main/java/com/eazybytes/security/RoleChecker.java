package com.eazybytes.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class RoleChecker {
    public boolean hasRole(String requiredRole) {
        String rolesHeader = ((ServletRequestAttributes) RequestContextHolder
                .currentRequestAttributes())
                .getRequest()
                .getHeader("X-Auth-Roles");

        if (rolesHeader == null) {
            return false;
        }
        List<String> roles = Arrays.asList(rolesHeader.split(","));
        return roles.contains("ROLE_" + requiredRole);
    }
}

