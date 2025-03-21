package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
}
