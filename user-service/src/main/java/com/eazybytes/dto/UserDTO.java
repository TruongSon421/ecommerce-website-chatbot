package com.eazybytes.dto;

import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    private String username;
    @Email(message = "Email should be valid")
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean isActive;
    private List<AddressDTO> addresses;
}