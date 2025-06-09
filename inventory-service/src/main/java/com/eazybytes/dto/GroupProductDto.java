package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupProductDto {
    private String productId;
    private String variant;
    private Integer orderNumber;
    private String productName;
    private Integer defaultOriginalPrice;
    private Integer defaultCurrentPrice;
    private String defaultColor;
}