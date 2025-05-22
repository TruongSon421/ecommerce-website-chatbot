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
public class GroupDto {
    private Integer groupId;
    private Integer orderNumber;
    private String image;
    private String type;
    private String groupName;
    private String brand;
    private String productId; // From first GroupProduct
    private Double defaultOriginalPrice; // From first GroupProduct
    private Double defaultCurrentPrice; // From first GroupProduct
    public GroupDto(Integer groupId) {
    }
}