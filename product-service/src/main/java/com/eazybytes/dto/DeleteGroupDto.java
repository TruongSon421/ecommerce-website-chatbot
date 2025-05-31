package com.eazybytes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteGroupDto {
    
    @NotNull(message = "Group ID cannot be null")
    private Integer groupId;
    
    @NotNull(message = "Product IDs list cannot be null")
    private List<@NotBlank String> productIds;
    
}