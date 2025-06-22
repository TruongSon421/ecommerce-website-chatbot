package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserDTO {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscore")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must have at least 8 characters")
    private String password;

    @Size(max = 50, message = "First name cannot exceed 50 characters")
    @Pattern(regexp = "^[\\p{L}\\s]*$", message = "First name can only contain letters and spaces")
    private String firstName;

    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    @Pattern(regexp = "^[\\p{L}\\s]*$", message = "Last name can only contain letters and spaces")
    private String lastName;

    @Pattern(regexp = "^[0-9]{10,14}$", message = "Phone number must be 10-14 digits")
    private String phoneNumber;

    private List<String> roleNames;
}