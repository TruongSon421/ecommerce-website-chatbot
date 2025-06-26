package com.eazybytes.service;

import com.eazybytes.dto.LLMAnalysisResult;
import com.eazybytes.dto.SearchCondition;
import com.eazybytes.dto.SortField;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class LLMService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${llm.enabled:false}")
    private boolean llmEnabled;

    @PostConstruct
    public void debugConfig() {
        log.info("=== OpenAI Configuration Debug ===");
        log.info("LLM Enabled: {}", llmEnabled);
        log.info("OpenAI API URL: {}", openaiApiUrl);
        log.info("OpenAI Model: {}", openaiModel);
        
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            log.info("OpenAI API Key configured: Yes");
            log.info("API Key length: {}", openaiApiKey.length());
            log.info("API Key prefix: {}", openaiApiKey.substring(0, Math.min(15, openaiApiKey.length())));
            log.info("API Key format valid: {}", openaiApiKey.startsWith("sk-"));
        } else {
            log.warn("OpenAI API Key: NOT CONFIGURED");
        }
        log.info("=====================================");
    }

    @PostConstruct
    public void debugConfig() {
        log.info("=== OpenAI Configuration Debug ===");
        log.info("LLM Enabled: {}", llmEnabled);
        log.info("OpenAI API URL: {}", openaiApiUrl);
        log.info("OpenAI Model: {}", openaiModel);
        
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            log.info("OpenAI API Key configured: Yes");
            log.info("API Key length: {}", openaiApiKey.length());
            log.info("API Key prefix: {}", openaiApiKey.substring(0, Math.min(10, openaiApiKey.length())));
            log.info("API Key format valid: {}", openaiApiKey.startsWith("sk-"));
        } else {
            log.warn("OpenAI API Key: NOT CONFIGURED");
        }
        log.info("=====================================");
    }

    public LLMAnalysisResult analyzeQuery(String prompt) {
        try {
            if (!llmEnabled) {
                log.info("LLM is disabled, using fallback analysis");
                return createFallbackAnalysis();
            }

            if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
                log.warn("OpenAI API key is not configured, using fallback analysis");
                return createFallbackAnalysis();
            }

            // Validate API key format
            if (!openaiApiKey.startsWith("sk-")) {
                log.error("Invalid OpenAI API key format. Must start with 'sk-'");
                return createFallbackAnalysis();
            }

            log.info("Sending prompt to OpenAI GPT: {}", prompt.substring(0, Math.min(100, prompt.length())) + "...");
            log.debug("Using API Key: {}...{}", 
                openaiApiKey.substring(0, 10), 
                openaiApiKey.substring(openaiApiKey.length() - 4));

            // Prepare OpenAI API request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            // Add optional headers
            // headers.set("OpenAI-Organization", "your-org-id"); // Uncomment if needed

            // Build OpenAI chat completion request
            Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
            );

            Map<String, Object> requestBody = Map.of(
                "model", openaiModel,
                "messages", Arrays.asList(message),
                "max_tokens", 2000,
                "temperature", 0.1,
                "response_format", Map.of("type", "json_object")
            );

            log.debug("Request body: {}", requestBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Call OpenAI API
            ResponseEntity<String> response = restTemplate.exchange(
                openaiApiUrl,
                HttpMethod.POST,
                request,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("OpenAI API call successful");
                return parseOpenAIResponse(response.getBody());
            } else {
                log.error("OpenAI API returned error: {}", response.getStatusCode());
                return createFallbackAnalysis();
            }

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("OpenAI API HTTP Error: {}", e.getStatusCode());
            log.error("Error body: {}", e.getResponseBodyAsString());
            
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.error("API Key Authentication Failed!");
                log.error("Please check:");
                log.error("1. API key is correct and active");
                log.error("2. Billing is set up on OpenAI account");
                log.error("3. Usage limits not exceeded");
                log.error("4. API key has proper permissions");
            }
            
            return createFallbackAnalysis();
        } catch (Exception e) {
            log.error("Error calling OpenAI API: ", e);
            return createFallbackAnalysis();
        }
    }

    private LLMAnalysisResult parseOpenAIResponse(String responseBody) {
        try {
            log.debug("OpenAI response: {}", responseBody);

            JsonNode rootNode = objectMapper.readTree(responseBody);
            
            // Extract content from OpenAI response format
            String content = null;
            if (rootNode.has("choices") && rootNode.get("choices").isArray()) {
                JsonNode firstChoice = rootNode.get("choices").get(0);
                if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                    content = firstChoice.get("message").get("content").asText();
                }
            }

            if (content == null) {
                log.warn("No content found in OpenAI response");
                return createFallbackAnalysis();
            }

            return parseLLMResponse(content);

        } catch (JsonProcessingException e) {
            log.error("Error parsing OpenAI response: ", e);
            return createFallbackAnalysis();
        }
    }

    private LLMAnalysisResult parseLLMResponse(String responseText) {
        try {
            log.debug("LLM response: {}", responseText);

            // Extract JSON from response
            String jsonText = extractJsonFromText(responseText);
            if (jsonText == null) {
                log.warn("No valid JSON found in LLM response");
                return createFallbackAnalysis();
            }

            JsonNode rootNode = objectMapper.readTree(jsonText);

            // Parse conditions
            List<SearchCondition> conditions = new ArrayList<>();
            if (rootNode.has("conditions") && rootNode.get("conditions").isArray()) {
                for (JsonNode conditionNode : rootNode.get("conditions")) {
                    SearchCondition condition = parseSearchCondition(conditionNode);
                    if (condition != null) {
                        conditions.add(condition);
                    }
                }
            }

            // Parse sort fields
            List<SortField> sortFields = new ArrayList<>();
            if (rootNode.has("sort_fields") && rootNode.get("sort_fields").isArray()) {
                for (JsonNode sortNode : rootNode.get("sort_fields")) {
                    SortField sortField = parseSortField(sortNode);
                    if (sortField != null) {
                        sortFields.add(sortField);
                    }
                }
            }

            // Parse text search fields
            List<String> textSearchFields = new ArrayList<>();
            if (rootNode.has("text_search_fields") && rootNode.get("text_search_fields").isArray()) {
                for (JsonNode fieldNode : rootNode.get("text_search_fields")) {
                    if (fieldNode.isTextual()) {
                        textSearchFields.add(fieldNode.asText());
                    }
                }
            }

            // Parse text search keywords
            List<String> textSearchKeywords = new ArrayList<>();
            if (rootNode.has("text_search_keywords") && rootNode.get("text_search_keywords").isArray()) {
                for (JsonNode keywordNode : rootNode.get("text_search_keywords")) {
                    if (keywordNode.isTextual()) {
                        textSearchKeywords.add(keywordNode.asText());
                    }
                }
            }

            return LLMAnalysisResult.builder()
                .conditions(conditions)
                .sortFields(sortFields)
                .textSearchFields(textSearchFields)
                .textSearchKeywords(textSearchKeywords)
                .build();

        } catch (JsonProcessingException e) {
            log.error("Error parsing LLM JSON response: ", e);
            return createFallbackAnalysis();
        }
    }

    private String extractJsonFromText(String text) {
        // Try to find JSON object in the text
        Pattern jsonPattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
        Matcher matcher = jsonPattern.matcher(text.trim());
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        return null;
    }

    private SearchCondition parseSearchCondition(JsonNode conditionNode) {
        try {
            String field = conditionNode.has("field") ? conditionNode.get("field").asText() : null;
            String operator = conditionNode.has("operator") ? conditionNode.get("operator").asText() : null;
            String type = conditionNode.has("type") ? conditionNode.get("type").asText() : "string";
            boolean isArray = conditionNode.has("is_array") && conditionNode.get("is_array").asBoolean();

            Object value = null;
            if (conditionNode.has("value")) {
                JsonNode valueNode = conditionNode.get("value");
                if (valueNode.isTextual()) {
                    value = valueNode.asText();
                } else if (valueNode.isNumber()) {
                    value = valueNode.asDouble();
                } else if (valueNode.isArray()) {
                    List<Object> arrayValue = new ArrayList<>();
                    for (JsonNode item : valueNode) {
                        if (item.isTextual()) {
                            arrayValue.add(item.asText());
                        } else if (item.isNumber()) {
                            arrayValue.add(item.asDouble());
                        }
                    }
                    value = arrayValue;
                }
            }

            if (field != null && operator != null && value != null) {
                return SearchCondition.builder()
                    .field(field)
                    .operator(operator)
                    .value(value)
                    .type(type)
                    .isArray(isArray)
                    .build();
            }

        } catch (Exception e) {
            log.warn("Error parsing search condition: {}", e.getMessage());
        }
        
        return null;
    }

    private SortField parseSortField(JsonNode sortNode) {
        try {
            String field = sortNode.has("field") ? sortNode.get("field").asText() : null;
            String order = sortNode.has("order") ? sortNode.get("order").asText() : "desc";
            int priority = sortNode.has("priority") ? sortNode.get("priority").asInt() : 1;

            if (field != null) {
                return SortField.builder()
                    .field(field)
                    .order(order)
                    .priority(priority)
                    .build();
            }

        } catch (Exception e) {
            log.warn("Error parsing sort field: {}", e.getMessage());
        }
        
        return null;
    }

    private LLMAnalysisResult createFallbackAnalysis() {
        log.info("Creating fallback analysis result");
        
        return LLMAnalysisResult.builder()
            .conditions(Collections.emptyList())
            .sortFields(Collections.emptyList())
            .textSearchFields(Arrays.asList("productName", "description"))
            .textSearchKeywords(Collections.emptyList())
            .build();
    }

    // Alternative method using a simpler keyword-based analysis when LLM is not available
    public LLMAnalysisResult analyzeQueryFallback(String query, String deviceType) {
        log.info("Using fallback keyword analysis for query: {}", query);
        
        List<SearchCondition> conditions = new ArrayList<>();
        List<String> textSearchKeywords = new ArrayList<>();
        List<SortField> sortFields = new ArrayList<>();
        
        // Simple keyword extraction
        String[] words = query.toLowerCase().split("\\s+");
        
        for (String word : words) {
            if (word.length() > 2) {
                textSearchKeywords.add(word);
                
                // Simple pattern matching for common specs
                if (word.matches("\\d+gb") || word.matches("\\d+ram")) {
                    // RAM or storage
                    String numberStr = word.replaceAll("[^\\d]", "");
                    conditions.add(SearchCondition.builder()
                        .field("ram")
                        .operator("gte")
                        .value(numberStr)
                        .type("number")
                        .isArray(false)
                        .build());
                }
                else if (word.contains("ryzen") || word.contains("intel") || word.contains("amd")) {
                    conditions.add(SearchCondition.builder()
                        .field("processorModel")
                        .operator("regex")
                        .value(word)
                        .type("string")
                        .isArray(false)
                        .build());
                }
                else if (word.contains("rtx") || word.contains("gtx")) {
                    conditions.add(SearchCondition.builder()
                        .field("graphicCard")
                        .operator("regex")
                        .value(word)
                        .type("string")
                        .isArray(false)
                        .build());
                }
                else if (word.contains("cao") && (word.contains("nhất") || word.contains("nhat"))) {
                    // "cao nhất" - highest
                    sortFields.add(SortField.builder()
                        .field("ram")
                        .order("desc")
                        .priority(1)
                        .build());
                }
                else if (word.contains("rẻ") && (word.contains("nhất") || word.contains("nhat"))) {
                    // "rẻ nhất" - cheapest
                    sortFields.add(SortField.builder()
                        .field("currentPrice")
                        .order("asc")
                        .priority(1)
                        .build());
                }
            }
        }
        
        return LLMAnalysisResult.builder()
            .conditions(conditions)
            .sortFields(sortFields)
            .textSearchFields(Arrays.asList("productName", "description", "brand"))
            .textSearchKeywords(textSearchKeywords)
            .build();
    }
}