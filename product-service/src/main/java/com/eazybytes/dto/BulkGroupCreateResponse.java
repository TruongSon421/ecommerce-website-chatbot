package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BulkGroupCreateResponse {
    
    private boolean success;
    private Integer groupId;
    private List<String> productIds;
    private List<String> failedProducts;
    private String message;
} 