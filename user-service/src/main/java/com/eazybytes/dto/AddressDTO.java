package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import com.eazybytes.model.AddressType;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressDTO {
    private Long id;
    
    @NotBlank(message = "Province is required")
    @Size(min = 2, max = 100, message = "Province must be between 2-100 characters")
    private String province;
    
    @NotBlank(message = "District is required")
    @Size(min = 2, max = 100, message = "District must be between 2-100 characters")
    private String district;
    
    @NotBlank(message = "Ward is required")
    @Size(min = 2, max = 100, message = "Ward must be between 2-100 characters")
    private String ward;
    
    @NotBlank(message = "Street is required")
    @Size(min = 5, max = 255, message = "Street must be between 5-255 characters")
    private String street;
    
    @NotNull(message = "Address type is required")
    private AddressType addressType;
    
    @NotBlank(message = "Receiver name is required")
    @Size(min = 2, max = 100, message = "Receiver name must be between 2-100 characters")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Receiver name can only contain letters and spaces")
    private String receiverName;
    
    // ✅ Phone number as String với proper validation
    @NotBlank(message = "Receiver phone is required")
    @Pattern(regexp = "^[0-9]{10,14}$", message = "Phone number must be 10-14 digits")
    private String receiverPhone;
    
    @NotNull(message = "Default status is required")
    private Boolean isDefault;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}