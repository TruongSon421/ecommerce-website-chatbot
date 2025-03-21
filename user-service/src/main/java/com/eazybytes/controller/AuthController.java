package com.eazybytes.controller;

import com.eazybytes.dto.*;
import com.eazybytes.model.ERole;
import com.eazybytes.model.Role;
import com.eazybytes.model.User;
import com.eazybytes.repository.RoleRepository;
import com.eazybytes.repository.UserRepository;
import com.eazybytes.security.JwtUtils;
import com.eazybytes.security.UserDetailsImpl;
import com.eazybytes.security.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

// src/main/java/com/eazybytes/controller/AuthController.java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    private final RestTemplate restTemplate;



    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String accessToken = jwtUtils.generateJwtToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(
                accessToken,
                refreshToken,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .build();

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        if (jwtUtils.validateRefreshToken(requestRefreshToken)) {
            String username = jwtUtils.getUserNameFromJwtToken(requestRefreshToken);
            UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsService.loadUserByUsername(username);

            String newAccessToken = jwtUtils.generateJwtToken(userDetails);
            String newRefreshToken = jwtUtils.generateRefreshToken(userDetails);

            BlacklistRequest blacklistRequest = new BlacklistRequest(requestRefreshToken);
            restTemplate.postForEntity("http://api-gateway/api/internal/blacklist", blacklistRequest, Void.class);

            return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, newRefreshToken));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("Authorization") String token,
            @RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken) {

        BlacklistRequest accessTokenRequest = new BlacklistRequest(token);
        restTemplate.postForEntity("http://api-gateway/api/internal/blacklist", accessTokenRequest, Void.class);

        if (refreshToken != null && !refreshToken.isEmpty()) {
            BlacklistRequest refreshTokenRequest = new BlacklistRequest(refreshToken);
            restTemplate.postForEntity("http://api-gateway/api/internal/blacklist", refreshTokenRequest, Void.class);
        }

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }
}
