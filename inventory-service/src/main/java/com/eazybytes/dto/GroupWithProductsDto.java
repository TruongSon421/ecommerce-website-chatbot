package com.eazybytes.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
<<<<<<< HEAD
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupWithProductsDto {
    private List<GroupProductDto> products;
    private GroupDto groupDto;
    private Float elasticsearchScore; // Thêm trường mới

    public GroupWithProductsDto(GroupDto groupDto, List<GroupProductDto> productDtos) {
=======
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupWithProductsDto {
    private GroupDto groupDto;
    private List<GroupProductDto> products;
    @Deprecated
    private Float elasticsearchScore; // Keep for backward compatibility
    private Float mongoDbScore; // New field for MongoDB scores
    
    // Getter method for compatibility
    public Float getElasticsearchScore() {
        return mongoDbScore != null ? mongoDbScore : elasticsearchScore;
>>>>>>> server
    }
}