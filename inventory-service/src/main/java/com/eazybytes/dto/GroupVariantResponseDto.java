package com.eazybytes.dto;

import lombok.Data;

import java.util.List;

@Data
public class GroupVariantResponseDto {
    private Integer groupId;
    private String groupName;
    private List<VariantDto> variants;
}