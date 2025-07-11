// MongoSearchResult.java
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
public class MongoSearchResult {
    private List<String> productIds;
    private String searchMethod;
    private List<ConditionInfo> appliedConditions;
    private List<SortField> sortFields;
    private List<String> textSearchKeywords;
    private int resultsCount;
    private boolean success;
    private String error;
}