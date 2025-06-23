    package com.eazybytes.filter;

    import com.eazybytes.config.RouterValidator;
    import com.eazybytes.security.JwtUtils;
    import io.jsonwebtoken.Claims;
    import org.springframework.cloud.gateway.filter.GatewayFilter;
    import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
    import org.springframework.http.HttpHeaders;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.server.reactive.ServerHttpRequest;
    import org.springframework.stereotype.Component;
    import org.springframework.web.server.ServerWebExchange;
    import reactor.core.publisher.Mono;

    import java.util.ArrayList;
    import java.util.List;
    import java.util.Map;
    import java.util.stream.Collectors;

    @Component
    public class AuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<AuthenticationGatewayFilterFactory.Config> {
        private final JwtUtils jwtUtils;
        private final RouterValidator routerValidator;

        public AuthenticationGatewayFilterFactory(JwtUtils jwtUtils, RouterValidator routerValidator) {
            super(Config.class);
            this.jwtUtils = jwtUtils;
            this.routerValidator = routerValidator;
            System.out.println("AuthenticationGatewayFilterFactory initialized with " +
                    routerValidator.openApiEndpoints.size() + " open endpoints");
        }

        @Override
        public GatewayFilter apply(Config config) {
            return ((exchange, chain) -> {
                String path = exchange.getRequest().getURI().getPath();
                System.out.println("Filter applied to: " + path);

                boolean isSecured = routerValidator.isSecured.test(exchange.getRequest());
                System.out.println("Is path secured: " + isSecured);

                if (isSecured) {
                    if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                        System.out.println("No authorization header found");
                        return onError(exchange, "No authorization header", HttpStatus.UNAUTHORIZED);
                    }

                    String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                    String token = authHeader.substring(7);

                    try {
                        // Validate token, including blacklist check
                        if (!jwtUtils.validateJwtToken(token)) {
                            System.out.println("Invalid JWT token");
                            return onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
                        }

                        // Extract user information from token
                        String username = jwtUtils.getUserNameFromJwtToken(token);
                        Claims claims = jwtUtils.getAllClaimsFromToken(token);


                        Long userId = claims.get("userId", Long.class);
                        List<Map<String, String>> rolesList = claims.get("roles", List.class);
                        List<String> authorities = new ArrayList<>();

                        if (rolesList != null) {
                            authorities = rolesList.stream()
                                    .map(role -> {
                                        if (role instanceof Map) {
                                            return ((Map<?, ?>) role).get("authority").toString();
                                        }
                                        return role.toString();
                                    })
                                    .collect(Collectors.toList());
                        }
                        System.out.println("roles:" + String.join(",", authorities) + "\nuser id:" + userId.toString());
                        ServerHttpRequest request = exchange.getRequest().mutate()
                                .header("X-Auth-Username", username)
                                .header("X-Auth-UserId", userId.toString())
                                .header("X-Auth-Roles", String.join(",", authorities))
                                .build();

                        System.out.println("Added headers to request, forwarding to service");

                        // Create a new exchange with the modified request
                        return chain.filter(exchange.mutate().request(request).build());

                    } catch (Exception e) {
                        System.err.println("Error processing JWT: " + e.getMessage());
                        e.printStackTrace();
                        return onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
                    }
                } else {
                    System.out.println("Path is not secured, passing through");
                    return chain.filter(exchange);
                }
            });
        }

        private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
            System.out.println("Returning error: " + err + " with status: " + httpStatus);
            exchange.getResponse().setStatusCode(httpStatus);
            return exchange.getResponse().setComplete();
        }

        public static class Config {
        }
    }