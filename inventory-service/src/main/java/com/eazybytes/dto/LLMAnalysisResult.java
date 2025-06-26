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
public class LLMAnalysisResult {
    private List<SearchCondition> conditions;
    private List<SortField> sortFields;
    private List<String> textSearchFields;
    private List<String> textSearchKeywords;
}