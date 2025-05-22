package com.eazybytes.dto;

import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Set;

@Data
public class CreateUserDTO {
    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean isActive;
    private Set<String> roleNames;
    private List<AddressDTO> addresses;
}