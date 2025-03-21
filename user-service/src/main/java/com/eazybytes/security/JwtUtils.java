package com.eazybytes.security;

import com.eazybytes.dto.BlacklistCheckResponse;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.security.Key;
import java.util.Date;

@Component
@Slf4j  // Cho việc logging
public class JwtUtils {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @Value("${jwt.refresh-expiration}")
    private int refreshTokenExpirationMs;

    private final RestTemplate restTemplate;

    public JwtUtils(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String generateJwtToken(UserDetailsImpl userPrincipal) {
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .claim("roles", userPrincipal.getAuthorities())
                .claim("userId", userPrincipal.getId())
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String generateRefreshToken(UserDetailsImpl userPrincipal) {
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + refreshTokenExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public boolean validateRefreshToken(String refreshToken) {
        try {
            // Kiểm tra blacklist bằng cách gọi API Gateway
            ResponseEntity<BlacklistCheckResponse> response =
                    restTemplate.getForEntity(
                            "http://api-gateway/api/internal/blacklist/check?token=" + refreshToken,
                            BlacklistCheckResponse.class
                    );

            if (response.getStatusCode() == HttpStatus.OK &&
                    response.getBody() != null &&
                    response.getBody().isBlacklisted()) {
                return false;
            }

            // Validate token như bình thường
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(refreshToken);

            return true;
        } catch (Exception e) {
            log.error("Error validating refresh token: {}", e.getMessage());
            return false;
        }
    }
    public boolean validateJwtToken(String authToken) {
        try {
            // Kiểm tra blacklist bằng cách gọi API Gateway
            ResponseEntity<BlacklistCheckResponse> response =
                    restTemplate.getForEntity(
                            "http://api-gateway/api/internal/blacklist/check?token=" + authToken,
                            BlacklistCheckResponse.class
                    );

            if (response.getStatusCode() == HttpStatus.OK &&
                    response.getBody() != null &&
                    response.getBody().isBlacklisted()) {
                log.error("JWT token is blacklisted");
                return false;
            }

            // Validate token như bình thường
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error validating JWT token: {}", e.getMessage());
        }
        return false;
    }
}