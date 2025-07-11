package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BulkGroupCreateRequest {
    
    @NotBlank(message = "Group name is required")
    private String groupName;
    
    @NotBlank(message = "Brand is required")
    private String brand;
    
    @NotBlank(message = "Type is required")
    private String type;
    
    private String image;
    
    @NotEmpty(message = "Products list cannot be empty")
    @Valid
    private List<ProductWithInventoryRequest> products;
} 