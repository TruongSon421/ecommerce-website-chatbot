package com.eazybytes.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupWithProductsDto {
    private List<GroupProductDto> products;
    private GroupDto groupDto;
    private Float elasticsearchScore; // Thêm trường mới

    public GroupWithProductsDto(GroupDto groupDto, List<GroupProductDto> productDtos) {
    }
}