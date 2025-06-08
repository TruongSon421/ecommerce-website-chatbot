package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import com.eazybytes.model.AddressType;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressDTO {
    private Long id;
    @NotBlank(message = "Province is required")
    private String province;
    @NotBlank(message = "District is required")
    private String district;
    @NotBlank(message = "Ward is required")
    private String ward;
    @NotBlank(message = "Street is required")
    private String street;
    private AddressType addressType;
    @NotBlank(message = "Receiver name is required")
    private String receiverName;
    @NotBlank(message = "Receiver phone is required")
    private Long receiverPhone;
    private Boolean isDefault;
}