package com.eazybytes.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
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
    }
}