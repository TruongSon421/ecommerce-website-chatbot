package com.eazybytes.service;

import com.eazybytes.dto.*;
import com.eazybytes.model.GroupProduct;
import com.eazybytes.model.Group;
import com.eazybytes.model.ProductInventory;
import com.eazybytes.repository.GroupProductRepository;
import com.eazybytes.repository.GroupRepository;
import com.eazybytes.repository.ProductInventoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.hibernate.service.spi.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ProductInventoryRepository productInventoryRepository;

    @Autowired
    private GroupProductRepository groupProductRepository;

    @Autowired
    private LLMService llmService; // Service để gọi LLM

    @Autowired
    private MongoTemplate mongoTemplate;

    @Value("${mongodb.database.name:products}")
    private String mongoDatabase;

    @Value("${mongodb.collection.name:baseProduct}")
    private String mongoCollection;

    // Device type mappings
    private static final Map<String, String> DEVICE_TYPE_TO_CLASS = Map.of(
        "laptop", "com.eazybytes.model.Laptop",
        "phone", "com.eazybytes.model.Phone",
        "wireless_earphone", "com.eazybytes.model.WirelessEarphone",
        "wired_earphone", "com.eazybytes.model.WiredEarphone",
        "headphone", "com.eazybytes.model.Headphone",
        "backup_charger", "com.eazybytes.model.BackupCharger"
    );

    // Device fields mappings - Optimized for common user queries
    private static final Map<String, List<String>> DEVICE_FIELDS = Map.of(
        "laptop", Arrays.asList(
            // CPU/Processor - commonly asked
            "processorModel", "coreCount", "threadCount", "cpuSpeed", "maxCpuSpeed",
            // Memory - very commonly asked
            "ram", "ramType", "maxRam", 
            // Storage - very commonly asked
            "storage",
            // Display - commonly asked
            "screenSize", "resolution", "refreshRate", "displayTechnology",
            // Graphics - commonly asked for gaming
            "graphicCard", 
            // Connectivity - commonly asked
            "ports", "wirelessConnectivity", 
            // Battery - commonly asked
            "battery", 
            // OS - commonly asked
            "os",
            // Basic info - always needed
            "brand", "productName", "description"
        ),
        "phone", Arrays.asList(
            // Performance - commonly asked
            "processor", "ram", "gpu",
            // Storage - very commonly asked
            "storage", "availableStorage",
            // Camera - very commonly asked
            "rearCameraResolution", "frontCameraResolution", "rearCameraFeatures", "frontCameraFeatures",
            // Display - commonly asked
            "screenSize", "displayTechnology", "displayResolution", "maxBrightness",
            // Battery - very commonly asked
            "batteryCapacity", "batteryType", "maxChargingPower", "batteryFeatures",
            // Connectivity - commonly asked
            "mobileNetwork", "wifi", "bluetooth", "headphoneJack",
            // Security & Features - commonly asked
            "securityFeatures", "specialFeatures", "waterResistance",
            // OS - commonly asked
            "os",
            // Basic info - always needed
            "brand", "productName", "description"
        ),
        "wireless_earphone", Arrays.asList(
            "batteryLife", "chargingCaseBatteryLife", "chargingPort", "audioTechnology",
            "connectionTechnology", "simultaneousConnections", "compatibility", "connectionApp",
            "features", "controlType", "controlButtons", "size", "brandOrigin", "manufactured",
            "brand", "productName", "description"
        ),
        "wired_earphone", Arrays.asList(
            "audioJack", "cableLength", "simultaneousConnections", "compatibility",
            "features", "controlType", "controlButtons", "weight", "brandOrigin", "manufactured",
            "brand", "productName", "description"
        ),
        "headphone", Arrays.asList(
            "batteryLife", "chargingPort", "audioJack", "connectionTechnology", "simultaneousConnections",
            "compatibility", "features", "controlType", "controlButtons", "size", "weight",
            "brandOrigin", "manufactured", "brand", "productName", "description"
        ),
        "backup_charger", Arrays.asList(
            "batteryCapacity", "batteryCellType", "input", "output", "chargingTime",
            "technologyFeatures", "size", "weight", "brandOrigin", "manufactured",
            "brand", "productName", "description"
        )
    );

    // Sortable fields with units for numeric sorting
    private static final Map<String, Map<String, List<String>>> SORTABLE_FIELDS_WITH_UNITS = Map.of(
        "phone", Map.of(
            "batteryCapacity", Arrays.asList("mAh", "mah", "MAH"), // Pin lớn nhất/nhỏ nhất
            "ram", Arrays.asList("GB", "gb", "Gb", "MB", "mb", "Mb"), // RAM lớn nhất/nhỏ nhất
            "storage", Arrays.asList("GB", "gb", "Gb", "TB", "tb", "Tb", "MB", "mb", "Mb"), // Bộ nhớ lớn nhất/nhỏ nhất
            "availableStorage", Arrays.asList("GB", "gb", "Gb", "TB", "tb", "Tb", "MB", "mb", "Mb"), // Bộ nhớ khả dụng lớn nhất/nhỏ nhất
            "screenSize", Arrays.asList("inch", "in", "\"", "′", "inches"), // Màn hình lớn nhất/nhỏ nhất
            "maxBrightness", Arrays.asList("nits", "cd/m²", "cd/m2"), // Độ sáng cao nhất/thấp nhất
            "maxChargingPower", Arrays.asList("W", "w", "watt", "Watt"), // Sạc nhanh nhất/chậm nhất
            "rearCameraResolution", Arrays.asList("MP", "mp", "megapixel", "Megapixel"), // Camera sau tốt nhất
            "frontCameraResolution", Arrays.asList("MP", "mp", "megapixel", "Megapixel") // Camera trước tốt nhất
        ),
        
        "laptop", Map.of(
            "ram", Arrays.asList("GB", "gb", "Gb", "MB", "mb", "Mb"), // RAM lớn nhất/nhỏ nhất
            "maxRam", Arrays.asList("GB", "gb", "Gb", "MB", "mb", "Mb"), // RAM tối đa lớn nhất/nhỏ nhất
            "battery", Arrays.asList("Wh", "wh", "WH", "mAh", "mah", "MAH"), // Pin lớn nhất/nhỏ nhất
            "screenSize", Arrays.asList("inch", "in", "\"", "′", "inches"), // Màn hình lớn nhất/nhỏ nhất
            "refreshRate", Arrays.asList("Hz", "hz", "HZ"), // Tần số quét cao nhất/thấp nhất
            "coreCount", Arrays.asList("core", "cores", "nhân"), // Số nhân nhiều nhất/ít nhất
            "threadCount", Arrays.asList("thread", "threads", "luồng"), // Số luồng nhiều nhất/ít nhất
            "cpuSpeed", Arrays.asList("GHz", "ghz", "GHZ", "MHz", "mhz", "MHZ"), // Tốc độ CPU cao nhất/thấp nhất
            "maxCpuSpeed", Arrays.asList("GHz", "ghz", "GHZ", "MHz", "mhz", "MHZ"), // Tốc độ CPU tối đa cao nhất/thấp nhất
            "ramBusSpeed", Arrays.asList("MHz", "mhz", "MHZ", "MT/s", "mt/s") // Tốc độ RAM cao nhất/thấp nhất
        ),
        
        "wireless_earphone", Map.of(
            "batteryLife", Arrays.asList("giờ", "h", "hour", "hours", "tiếng"), // Pin lâu nhất/ngắn nhất
            "chargingCaseBatteryLife", Arrays.asList("giờ", "h", "hour", "hours", "tiếng"), // Pin hộp sạc lâu nhất/ngắn nhất
            "weight", Arrays.asList("g", "gram", "grams", "gr", "kg") // Nhẹ nhất/nặng nhất
        ),
        
        "wired_earphone", Map.of(
            "weight", Arrays.asList("g", "gram", "grams", "gr", "kg"), // Nhẹ nhất/nặng nhất
            "cableLength", Arrays.asList("m", "cm", "mm", "meter", "centimeter") // Dây dài nhất/ngắn nhất
        ),
        
        "headphone", Map.of(
            "batteryLife", Arrays.asList("giờ", "h", "hour", "hours", "tiếng"), // Pin lâu nhất/ngắn nhất
            "weight", Arrays.asList("g", "gram", "grams", "gr", "kg") // Nhẹ nhất/nặng nhất
        ),
        
        "backup_charger", Map.of(
            "batteryCapacity", Arrays.asList("mAh", "mah", "MAH", "Wh", "wh", "WH"), // Dung lượng lớn nhất/nhỏ nhất
            "weight", Arrays.asList("g", "gram", "grams", "gr", "kg") // Nhẹ nhất/nặng nhất
        )
    );

    // MongoDB-based search with actual database queries
    public MongoSearchResult smartSearchProducts(String query, String deviceType, int topK) {
        try {
            log.info("MongoDB search for query: '{}', deviceType: '{}', topK: {}", query, deviceType, topK);

            // Step 1: Analyze query using LLM
            LLMAnalysisResult analysis;
            try {
                List<String> deviceFields = DEVICE_FIELDS.getOrDefault(deviceType.toLowerCase(), Collections.emptyList());
                String llmPrompt = buildLLMPrompt(query, deviceType, deviceFields);
                analysis = llmService.analyzeQuery(llmPrompt);
                log.info("LLM analysis successful: {}", analysis);
            } catch (Exception e) {
                log.warn("LLM analysis failed, using fallback: {}", e.getMessage());
                analysis = llmService.analyzeQueryFallback(query, deviceType);
            }

            // Step 2: Build MongoDB aggregation pipeline
            List<AggregationOperation> pipeline = buildMongoAggregationPipeline(analysis, deviceType, topK);
            
            // Step 3: Execute MongoDB aggregation với numeric sorting
            List<String> productIds;
            boolean hasNumericSort = analysis.getSortFields().stream()
                .anyMatch(sortField -> isNumericSortField(deviceType, sortField.getField()));
                
            if (hasNumericSort) {
                log.info("Using numeric sorting for device type: {}", deviceType);
                productIds = executeMongoAggregationWithNumericSort(pipeline, analysis, deviceType, topK);
            } else {
                log.info("Using regular sorting");
                productIds = executeMongoAggregation(pipeline);
            }

            // Step 4: If no results from field conditions, try text search
            if (productIds.isEmpty() && !analysis.getTextSearchKeywords().isEmpty()) {
                log.info("No results from field conditions, trying text search...");
                productIds = executeMongoTextSearch(analysis, deviceType, topK);
            }

            String searchMethod = determineSearchMethod(analysis, productIds.isEmpty());
            if (hasNumericSort && !productIds.isEmpty()) {
                searchMethod += " + Numeric Sort";
            }
            
            log.info("MongoDB search found {} product_ids using method: {}", productIds.size(), searchMethod);

            return MongoSearchResult.builder()
                .productIds(productIds)
                .searchMethod(searchMethod)
                .appliedConditions(convertToConditionInfo(analysis.getConditions()))
                .sortFields(analysis.getSortFields())
                .textSearchKeywords(analysis.getTextSearchKeywords())
                .resultsCount(productIds.size())
                .success(!productIds.isEmpty())
                .build();

        } catch (Exception e) {
            log.error("Error in MongoDB search: ", e);
            return MongoSearchResult.builder()
                .productIds(Collections.emptyList())
                .searchMethod("MongoDB Search Failed")
                .error(e.getMessage())
                .resultsCount(0)
                .success(false)
                .build();
        }
    }

    private List<AggregationOperation> buildMongoAggregationPipeline(LLMAnalysisResult analysis, String deviceType, int topK) {
        List<AggregationOperation> pipeline = new ArrayList<>();

        // Step 1: Match stage with device type and conditions
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Add device type filter
        String deviceClass = DEVICE_TYPE_TO_CLASS.get(deviceType.toLowerCase());
        if (deviceClass != null) {
            criteriaList.add(Criteria.where("_class").is(deviceClass));
        }

        // Add conditions from LLM analysis
        for (SearchCondition condition : analysis.getConditions()) {
            Criteria criteria = buildMongoCriteria(condition);
            if (criteria != null) {
                criteriaList.add(criteria);
                log.debug("Added MongoDB criteria: {} {} {}", condition.getField(), condition.getOperator(), condition.getValue());
            }
        }

        // Add match stage if we have criteria
        if (!criteriaList.isEmpty()) {
            Criteria combinedCriteria = new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));
            pipeline.add(Aggregation.match(combinedCriteria));
            log.debug("Added match stage with {} criteria", criteriaList.size());
        }

        // Step 2: Sort stage - sẽ xử lý numeric sorting ở application level
        if (!analysis.getSortFields().isEmpty()) {
            List<Sort.Order> orders = new ArrayList<>();
            for (SortField sortField : analysis.getSortFields()) {
                Sort.Direction direction = "desc".equals(sortField.getOrder()) ? Sort.Direction.DESC : Sort.Direction.ASC;
                orders.add(new Sort.Order(direction, sortField.getField()));
                
                log.info("Added sort field '{}' with direction '{}' (will apply numeric extraction if needed)", 
                         sortField.getField(), direction);
            }
            if (!orders.isEmpty()) {
                pipeline.add(Aggregation.sort(Sort.by(orders)));
                log.debug("Added sort stage with {} fields", orders.size());
            }
        }

        // Step 3: Limit stage với buffer để có thể sort lại
        // Lấy nhiều hơn để có thể sort numeric ở application level
        int bufferLimit = topK * 3; // Lấy gấp 3 để có đủ data cho numeric sorting
        pipeline.add(Aggregation.limit(bufferLimit));

        // Step 4: Project all fields để có thể sort numeric
        // Không project chỉ _id nữa mà lấy cả sort fields
        List<String> projectFields = new ArrayList<>();
        projectFields.add("_id");
        
        // Thêm sort fields vào projection
        for (SortField sortField : analysis.getSortFields()) {
            if (isNumericSortField(deviceType, sortField.getField())) {
                projectFields.add(sortField.getField());
            }
        }
        
        if (projectFields.size() > 1) {
            // Project specified fields
            String[] fieldsArray = projectFields.toArray(new String[0]);
            pipeline.add(Aggregation.project(fieldsArray));
        } else {
            // Default project only _id
            pipeline.add(Aggregation.project("_id"));
        }

        return pipeline;
    }

    private Criteria buildMongoCriteria(SearchCondition condition) {
        String field = condition.getField();
        String operator = condition.getOperator();
        Object value = condition.getValue();
        String type = condition.getType();
        boolean isArray = condition.isArray();

        if (field == null || operator == null || value == null) {
            return null;
        }

        log.debug("Building criteria for field: {}, operator: {}, value: {}, type: {}, isArray: {}", 
                field, operator, value, type, isArray);

        try {
            switch (operator) {
                case "elemMatch":
                    if (isArray) {
                        return Criteria.where(field).elemMatch(
                            Criteria.where("$regex").is(value.toString()).and("$options").is("i")
                        );
                    } else {
                        return Criteria.where(field).regex(value.toString(), "i");
                    }

                case "eq":
                    if (isArray) {
                        return Criteria.where(field).elemMatch(
                            Criteria.where("$regex").is(value.toString()).and("$options").is("i")
                        );
                    } else if ("number".equals(type)) {
                        // Extract number and use $expr for exact numeric comparison
                        Double numericValue = extractNumericValue(value);
                        if (numericValue != null) {
                            return buildNumericExprCriteria(field, "eq", numericValue);
                        } else {
                            return Criteria.where(field).regex("\\b" + Pattern.quote(value.toString()) + "\\b", "i");
                        }
                    } else {
                        return Criteria.where(field).regex("\\b" + Pattern.quote(value.toString()) + "\\b", "i");
                    }

                case "gte":
                case "gt":
                case "lte":
                case "lt":
                    if (isArray) {
                        return Criteria.where(field).elemMatch(
                            Criteria.where("$regex").is(value.toString()).and("$options").is("i")
                        );
                    } else if ("number".equals(type)) {
                        // **ĐÚNG CÁCH: Sử dụng $expr như Python code**
                        Double numericValue = extractNumericValue(value);
                        if (numericValue != null) {
                            log.info("Using $expr numeric comparison for field '{}' {} {}", field, operator, numericValue);
                            return buildNumericExprCriteria(field, operator, numericValue);
                        } else {
                            log.warn("Could not extract numeric value from: {}", value);
                            return Criteria.where(field).regex("\\b" + Pattern.quote(value.toString()) + "\\b", "i");
                        }
                    } else {
                        return Criteria.where(field).regex(value.toString(), "i");
                    }

                case "regex":
                    if (isArray) {
                        return Criteria.where(field).elemMatch(
                            Criteria.where("$regex").is(value.toString()).and("$options").is("i")
                        );
                    } else {
                        return Criteria.where(field).regex(value.toString(), "i");
                    }

                case "in":
                    List<Object> valuesList = value instanceof List ? (List<Object>) value : Arrays.asList(value);
                    if (isArray) {
                        List<Criteria> arrayConditions = new ArrayList<>();
                        for (Object val : valuesList) {
                            arrayConditions.add(
                                Criteria.where(field).elemMatch(
                                    Criteria.where("$regex").is(val.toString()).and("$options").is("i")
                                )
                            );
                        }
                        if (arrayConditions.size() == 1) {
                            return arrayConditions.get(0);
                        } else {
                            return new Criteria().orOperator(arrayConditions.toArray(new Criteria[0]));
                        }
                    } else {
                        return Criteria.where(field).in(valuesList);
                    }

                default:
                    log.warn("Unsupported operator: {}", operator);
                    return null;
            }
        } catch (Exception e) {
            log.error("Error building MongoDB criteria for field: {}, operator: {}, value: {}", 
                    field, operator, value, e);
            return null;
        }
    }

    /**
     * Extract numeric value from string (same logic as Python)
     */
    private Double extractNumericValue(Object value) {
        try {
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            
            String valueStr = value.toString();
            Pattern numberPattern = Pattern.compile("(\\d+(?:\\.\\d+)?)");
            Matcher matcher = numberPattern.matcher(valueStr);
            if (matcher.find()) {
                return Double.parseDouble(matcher.group(1));
            }
            
            return null;
        } catch (Exception e) {
            log.warn("Failed to extract numeric value from: {}", value);
            return null;
        }
    }

    /**
     * Build $expr criteria for numeric comparison (equivalent to Python's $expr logic)
     */
    private Criteria buildNumericExprCriteria(String field, String operator, Double numericValue) {
        try {
            // Build the same $expr structure as Python code
            String mongoOperator = "$" + operator;
            if ("eq".equals(operator)) {
                mongoOperator = "$eq";
            }
            
            Map<String, Object> regexFindAll = new HashMap<>();
            regexFindAll.put("input", "$" + field);
            regexFindAll.put("regex", "(\\d+(?:\\.\\d+)?)");
            
            Map<String, Object> mapExpr = new HashMap<>();
            mapExpr.put("input", Map.of("$regexFindAll", regexFindAll));
            mapExpr.put("as", "match");
            mapExpr.put("in", "$$match.match");
            
            Map<String, Object> arrayElemAt = new HashMap<>();
            arrayElemAt.put("$arrayElemAt", Arrays.asList(Map.of("$map", mapExpr), 0));
            
            Map<String, Object> convert = new HashMap<>();
            convert.put("input", arrayElemAt);
            convert.put("to", "double");
            convert.put("onError", 0);
            
            Map<String, Object> comparison = new HashMap<>();
            comparison.put(mongoOperator, Arrays.asList(Map.of("$convert", convert), numericValue));
            
            // Use raw MongoDB query through Criteria with proper syntax
            return new Criteria().andOperator(
                Criteria.where(field).exists(true),  // Ensure field exists
                new Criteria("$expr").is(comparison)  // Use $expr with comparison object
            );
            
        } catch (Exception e) {
            log.error("Error building $expr criteria for field: {}, operator: {}, value: {}", 
                    field, operator, numericValue, e);
            // Fallback to regex
            return Criteria.where(field).regex("\\b" + numericValue.intValue() + "\\b", "i");
        }
    }

    // Helper method để check field có cần numeric sorting không
    private boolean isNumericSortField(String deviceType, String field) {
        Map<String, List<String>> deviceSortableFields = SORTABLE_FIELDS_WITH_UNITS.get(deviceType.toLowerCase());
        return deviceSortableFields != null && deviceSortableFields.containsKey(field);
    }

    // Method mới để xử lý numeric sorting ở application level
    private List<String> executeMongoAggregationWithNumericSort(List<AggregationOperation> pipeline, 
                                                               LLMAnalysisResult analysis, 
                                                               String deviceType, 
                                                               int topK) {
        try {
            if (pipeline.isEmpty()) {
                log.info("Empty aggregation pipeline, skipping MongoDB query");
                return Collections.emptyList();
            }

            Aggregation aggregation = Aggregation.newAggregation(pipeline);
            AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, mongoCollection, Map.class);
            
            List<Map> documents = results.getMappedResults();
            log.info("MongoDB aggregation found {} products before numeric sorting", documents.size());

            // Check if we need to apply numeric sorting
            boolean needsNumericSort = false;
            SortField numericSortField = null;
            
            for (SortField sortField : analysis.getSortFields()) {
                if (isNumericSortField(deviceType, sortField.getField())) {
                    needsNumericSort = true;
                    numericSortField = sortField;
                    break; // Chỉ xử lý sort field đầu tiên
                }
            }

            if (needsNumericSort && numericSortField != null) {
                log.info("Applying numeric sorting for field: {}", numericSortField.getField());
                documents = applyNumericSorting(documents, numericSortField, deviceType);
            }

            // Extract product IDs và limit theo topK
            List<String> productIds = documents.stream()
                .limit(topK)
                .map(doc -> doc.get("_id").toString())
                .collect(Collectors.toList());

            log.info("After numeric sorting: {} products returned", productIds.size());
            return productIds;

        } catch (Exception e) {
            log.error("Error executing MongoDB aggregation with numeric sort: ", e);
            return Collections.emptyList();
        }
    }

    private List<Map> applyNumericSorting(List<Map> documents, SortField sortField, String deviceType) {
        String field = sortField.getField();
        String order = sortField.getOrder();
        
        List<String> validUnits = SORTABLE_FIELDS_WITH_UNITS.get(deviceType.toLowerCase()).get(field);
        
        // **THÊM DEBUG LOGGING**
        log.info("=== DEBUG NUMERIC SORTING ===");
        log.info("Field: {}, Order: {}, Valid units: {}", field, order, validUnits);
        log.info("Total documents before sorting: {}", documents.size());
        
        List<Map<String, Object>> processedDocuments = documents.stream()
            .filter(doc -> doc.get(field) != null) // Lọc documents có field
            .map(doc -> {
                String value = doc.get(field).toString();
                Double numericValue = null;
                
                // Check xem value có chứa valid unit không
                boolean hasUnit = hasValidUnit(value, validUnits);
                if (hasUnit) {
                    numericValue = extractNumericValueForSorting(value);
                }
                
                // **DEBUG LOG từng document**
                log.debug("Document ID: {}, Field value: '{}', Has valid unit: {}, Numeric value: {}", 
                        doc.get("_id"), value, hasUnit, numericValue);
                
                // Tạo wrapper object để sort
                Map<String, Object> wrapper = new HashMap<>();
                wrapper.put("document", doc);
                wrapper.put("numericValue", numericValue);
                wrapper.put("originalValue", value); // Keep for debug
                return wrapper;
            })
            .filter(wrapper -> wrapper.get("numericValue") != null) // Chỉ giữ documents có numeric value
            .collect(Collectors.toList());
        
        log.info("Documents with valid numeric values: {}", processedDocuments.size());
        
        // **LOG TOP 5 VALUES TRƯỚC KHI SORT**
        log.info("=== TOP 5 VALUES BEFORE SORTING ===");
        processedDocuments.stream()
            .limit(5)
            .forEach(wrapper -> {
                log.info("ID: {}, Original: '{}', Numeric: {}", 
                        ((Map)wrapper.get("document")).get("_id"),
                        wrapper.get("originalValue"),
                        wrapper.get("numericValue"));
            });
        
        // Sort documents
        List<Map<String, Object>> sortedWrappers = processedDocuments.stream()
            .sorted((w1, w2) -> {
                Double v1 = (Double) w1.get("numericValue");
                Double v2 = (Double) w2.get("numericValue");
                
                if ("desc".equals(order)) {
                    return v2.compareTo(v1); // Descending: lớn nhất trước
                } else {
                    return v1.compareTo(v2); // Ascending: nhỏ nhất trước
                }
            })
            .collect(Collectors.toList());
        
        // **LOG TOP 5 VALUES SAU KHI SORT**
        log.info("=== TOP 5 VALUES AFTER SORTING ({}) ===", order.toUpperCase());
        sortedWrappers.stream()
            .limit(5)
            .forEach(wrapper -> {
                log.info("ID: {}, Original: '{}', Numeric: {}", 
                        ((Map)wrapper.get("document")).get("_id"),
                        wrapper.get("originalValue"),
                        wrapper.get("numericValue"));
            });
        
        // Extract sorted documents
        List<Map> result = sortedWrappers.stream()
            .map(wrapper -> (Map) wrapper.get("document"))
            .collect(Collectors.toList());
        
        log.info("=== SORTING COMPLETE ===");
        log.info("Final result count: {}", result.size());
        
        return result;
    }

    public void testQuery(String query, String deviceType) {
        log.info("=== TESTING QUERY ===");
        log.info("Query: '{}'", query);
        log.info("Device type: '{}'", deviceType);
        
        try {
            // Test LLM analysis
            List<String> deviceFields = DEVICE_FIELDS.getOrDefault(deviceType.toLowerCase(), Collections.emptyList());
            String llmPrompt = buildLLMPrompt(query, deviceType, deviceFields);
            LLMAnalysisResult analysis = llmService.analyzeQuery(llmPrompt);
            
            log.info("LLM Analysis Result:");
            log.info("- Conditions: {}", analysis.getConditions());
            log.info("- Sort fields: {}", analysis.getSortFields());
            log.info("- Text search keywords: {}", analysis.getTextSearchKeywords());
            
            // Test MongoDB query
            MongoSearchResult searchResult = smartSearchProducts(query, deviceType, 10);
            
            log.info("MongoDB Search Result:");
            log.info("- Success: {}", searchResult.isSuccess());
            log.info("- Method: {}", searchResult.getSearchMethod());
            log.info("- Results count: {}", searchResult.getResultsCount());
            log.info("- Product IDs (first 5): {}", 
                    searchResult.getProductIds().stream().limit(5).collect(Collectors.toList()));
            
            // Test actual battery values từ MongoDB
            if (!searchResult.getProductIds().isEmpty()) {
                testActualBatteryValues(searchResult.getProductIds().subList(0, Math.min(5, searchResult.getProductIds().size())));
            }
            
        } catch (Exception e) {
            log.error("Error testing query: ", e);
        }
        
        log.info("=== END TESTING ===");
    }

    // Helper method để check actual battery values
    private void testActualBatteryValues(List<String> productIds) {
        log.info("=== CHECKING ACTUAL BATTERY VALUES ===");
        
        try {
            Query query = new Query();
            query.addCriteria(Criteria.where("_id").in(productIds));
            query.fields().include("_id", "batteryCapacity", "productName");
            
            List<Map> results = mongoTemplate.find(query, Map.class, mongoCollection);
            
            log.info("Found {} products with battery info:", results.size());
            results.forEach(doc -> {
                Object id = doc.get("_id");
                Object batteryCapacity = doc.get("batteryCapacity");
                Object productName = doc.get("productName");
                
                Double numericValue = null;
                if (batteryCapacity != null) {
                    numericValue = extractNumericValueForSorting(batteryCapacity.toString());
                }
                
                log.info("ID: {}, Name: '{}', Battery: '{}', Numeric: {}", 
                        id, productName, batteryCapacity, numericValue);
            });
            
        } catch (Exception e) {
            log.error("Error checking battery values: ", e);
        }
    }

    // Helper method để check value có chứa valid unit không
    private boolean hasValidUnit(String value, List<String> validUnits) {
        if (value == null || validUnits == null) {
            return false;
        }
        
        String valueLower = value.toLowerCase();
        return validUnits.stream().anyMatch(unit -> valueLower.contains(unit.toLowerCase()));
    }

    // Method để extract numeric value cho sorting
    private Double extractNumericValueForSorting(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Regex để tìm số (bao gồm số thập phân)
            Pattern numberPattern = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)");
            Matcher matcher = numberPattern.matcher(value);
            if (matcher.find()) {
                return Double.parseDouble(matcher.group(1));
            }
        } catch (NumberFormatException e) {
            log.warn("Could not extract numeric value from: {}", value);
        }
        
        return null;
    }

    private List<String> executeMongoAggregation(List<AggregationOperation> pipeline) {
        try {
            if (pipeline.isEmpty()) {
                log.info("Empty aggregation pipeline, skipping MongoDB query");
                return Collections.emptyList();
            }

            Aggregation aggregation = Aggregation.newAggregation(pipeline);
            AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, mongoCollection, Map.class);
            
            List<String> productIds = results.getMappedResults().stream()
                .map(doc -> doc.get("_id").toString())
                .collect(Collectors.toList());

            log.info("MongoDB aggregation found {} products", productIds.size());
            return productIds;

        } catch (Exception e) {
            log.error("Error executing MongoDB aggregation: ", e);
            return Collections.emptyList();
        }
    }

    private List<String> executeMongoTextSearch(LLMAnalysisResult analysis, String deviceType, int topK) {
        try {
            List<String> keywords = analysis.getTextSearchKeywords();
            List<String> searchFields = analysis.getTextSearchFields();
            
            if (keywords.isEmpty() || searchFields.isEmpty()) {
                return Collections.emptyList();
            }

            // Build text search criteria
            List<Criteria> textCriteria = new ArrayList<>();
            
            // Add device type filter
            String deviceClass = DEVICE_TYPE_TO_CLASS.get(deviceType.toLowerCase());
            if (deviceClass != null) {
                textCriteria.add(Criteria.where("_class").is(deviceClass));
            }

            // Add text search conditions for keywords
            for (String keyword : keywords.subList(0, Math.min(2, keywords.size()))) {
                List<Criteria> keywordCriteria = new ArrayList<>();
                for (String field : searchFields) {
                    keywordCriteria.add(Criteria.where(field).regex(keyword, "i"));
                }
                if (!keywordCriteria.isEmpty()) {
                    textCriteria.add(new Criteria().orOperator(keywordCriteria.toArray(new Criteria[0])));
                }
            }

            // Execute text search query
            if (!textCriteria.isEmpty()) {
                Query textQuery = new Query();
                textQuery.addCriteria(new Criteria().andOperator(textCriteria.toArray(new Criteria[0])));
                textQuery.limit(topK);
                textQuery.with(Sort.by(Sort.Direction.DESC, "_id")); // Default sort by _id

                List<Map> textResults = mongoTemplate.find(textQuery, Map.class, mongoCollection);
                List<String> productIds = textResults.stream()
                    .map(doc -> doc.get("_id").toString())
                    .collect(Collectors.toList());

                log.info("MongoDB text search found {} products for keywords: {}", productIds.size(), keywords);
                return productIds;
            }

        } catch (Exception e) {
            log.error("Error in MongoDB text search: ", e);
        }
        
        return Collections.emptyList();
    }

    private String determineSearchMethod(LLMAnalysisResult analysis, boolean isEmpty) {
        if (isEmpty) {
            return "No Results Found";
        }
        
        if (!analysis.getConditions().isEmpty() && !analysis.getSortFields().isEmpty()) {
            return "MongoDB Field Conditions + Sort";
        } else if (!analysis.getConditions().isEmpty()) {
            return "MongoDB Field Conditions";
        } else if (!analysis.getTextSearchKeywords().isEmpty()) {
            return "MongoDB Text Search";
        } else {
            return "MongoDB Basic Search";
        }
    }

    private List<ConditionInfo> convertToConditionInfo(List<SearchCondition> conditions) {
        return conditions.stream()
            .map(condition -> ConditionInfo.builder()
                .field(condition.getField())
                .operator(condition.getOperator())
                .value(condition.getValue().toString())
                .type(condition.getType())
                .isArray(condition.isArray())
                .build())
            .collect(Collectors.toList());
    }

    private List<String> simpleKeywordSearch(String query, String deviceType, int topK) {
        // Fallback search when all else fails
        try {
            Query fallbackQuery = new Query();
            
            // Add device type filter
            String deviceClass = DEVICE_TYPE_TO_CLASS.get(deviceType.toLowerCase());
            if (deviceClass != null) {
                fallbackQuery.addCriteria(Criteria.where("_class").is(deviceClass));
            }

            // Simple text search on product name and description
            String[] keywords = query.toLowerCase().split("\\s+");
            List<Criteria> keywordCriteria = new ArrayList<>();
            
            for (String keyword : keywords) {
                if (keyword.length() > 2) { // Skip very short words
                    List<Criteria> fieldCriteria = Arrays.asList(
                        Criteria.where("productName").regex(keyword, "i"),
                        Criteria.where("description").regex(keyword, "i")
                    );
                    keywordCriteria.add(new Criteria().orOperator(fieldCriteria.toArray(new Criteria[0])));
                }
            }

            if (!keywordCriteria.isEmpty()) {
                fallbackQuery.addCriteria(new Criteria().andOperator(keywordCriteria.toArray(new Criteria[0])));
            }

            fallbackQuery.limit(topK);

            List<Map> results = mongoTemplate.find(fallbackQuery, Map.class, mongoCollection);
            List<String> productIds = results.stream()
                .map(doc -> doc.get("_id").toString())
                .collect(Collectors.toList());
                
            log.info("Fallback search returned {} results", productIds.size());
            return productIds;

        } catch (Exception e) {
            log.error("Error in fallback keyword search: ", e);
            return Collections.emptyList();
        }
    }

    private String buildLLMPrompt(String query, String deviceType, List<String> deviceFields) {
        return String.format("""
            Bạn là chuyên gia tư vấn tìm kiếm sản phẩm. Phân tích yêu cầu cụ thể của người dùng và tạo tiêu chí tìm kiếm cho sản phẩm %s.
            
            TRUY VẤN NGƯỜI DÙNG: "%s"
            
            Các trường có sẵn cho %s: %s
            
            KIỂU DỮ LIỆU CÁC TRƯỜNG CHO %s:
            
            LAPTOP FIELDS:
            - Numeric: ram, maxRam, ramBusSpeed, coreCount, threadCount, refreshRate, battery, cpuSpeed, maxCpuSpeed
            - String: processorModel, ramType, screenSize, resolution, graphicCard, webcam, keyboardBacklight, size, material, os, brand, productName, description
            - Arrays: storage, colorGamut, displayTechnology, audioTechnology, ports, wirelessConnectivity, otherFeatures, touchScreen
            
            PHONE FIELDS:
            - Numeric: ram, storage, availableStorage, maxBrightness, maxChargingPower, batteryCapacity
            - String: processor, cpuSpeed, gpu, os, displayTechnology, displayResolution, screenSize, batteryType, mobileNetwork, simType, headphoneJack, waterResistance, designType, materials, sizeWeight, rearCameraResolution, frontCameraResolution, rearFlash, contactLimit, screenProtection, chargingPort, brand, productName, description
            - Arrays: rearCameraFeatures, frontCameraFeatures, rearVideoRecording, batteryFeatures, securityFeatures, specialFeatures, recording, video, audio, wifi, bluetooth, gps, otherConnectivity
            
            WIRELESS_EARPHONE FIELDS:
            - Numeric: batteryLife, chargingCaseBatteryLife, weight (extracted from text values)
            - String: simultaneousConnections, size, brandOrigin, manufactured, brand, productName, description
            - Arrays: chargingPort, audioTechnology, compatibility, connectionApp, features, connectionTechnology, controlType, controlButtons
            
            BACKUP_CHARGER FIELDS:
            - Numeric: batteryCapacity, weight (extracted from capacity and weight values)
            - String: chargingEfficiency, batteryCellType, size, brandOrigin, manufactured, brand, productName, description
            - Arrays: input, output, chargingTime, technologyFeatures
            
            HEADPHONE FIELDS:
            - Numeric: weight (extracted from text values)
            - String: batteryLife, chargingPort, audioJack, cableLength, simultaneousConnections, size, brandOrigin, manufactured, connectionApp, brand, productName, description
            - Arrays: connectionTechnology, compatibility, features, controlType, controlButtons, audioTechnology
            
            WIRED_EARPHONE FIELDS:
            - Numeric: weight
            - String: audioJack, cableLength, simultaneousConnections, brandOrigin, manufactured, brand, productName, description
            - Arrays: audioTechnology, compatibility, features, controlType, controlButtons
            
            QUY TẮC PHÂN TÍCH:
            1. **NUMERIC FIELDS** (dùng numeric operators: gte, lte, gt, lt):
               - RAM: "8GB", "16GB" → value: 8, 16
               - Storage/Dung lượng: "512GB", "1TB" → value: 512, 1024
               - CPU Speed: "2.4GHz", "3.2GHz" → value: 2.4, 3.2
               - Battery/Pin: "4000mAh", "5000mAh" → value: 4000, 5000
               - Camera: "48MP", "108MP" → value: 48, 108
               - Screen size: "6.1 inch", "15.6 inch" → value: 6.1, 15.6
            
            2. **STRING FIELDS** (dùng regex):
               - Processor/Chip: "Snapdragon 8 Gen 2", "Intel i7", "Ryzen 5"
               - GPU/Card đồ họa: "RTX 4070", "GTX 1650", "Adreno 740"
               - OS: "Windows 11", "Android 13", "iOS 16"
               - Brand: "Apple", "Samsung", "Dell"
            
            3. **ARRAY FIELDS** (dùng elemMatch hoặc in):
               - Features/Tính năng: "OIS", "5G", "Face ID", "Wireless charging"
               - Connectivity: "Wi-Fi 6", "Bluetooth 5.3", "USB-C", "Lightning"
               - Display tech: "OLED", "IPS", "AMOLED", "Retina"
               - Audio tech: "Dolby Atmos", "DTS:X", "Hi-Res Audio"
            
            4. **PHÂN BIỆT TOÁN TỬ SO SÁNH CHÍNH XÁC:**
               - "lớn hơn X", "trên X", "hơn X", "cao hơn X" → operator: "gt" (strictly greater than)
               - "từ X trở lên", "ít nhất X", "X trở lên", "tối thiểu X" → operator: "gte" (greater than or equal)
               - "nhỏ hơn X", "dưới X", "thấp hơn X", "ít hơn X" → operator: "lt" (strictly less than)  
               - "tối đa X", "không quá X", "X trở xuống", "nhiều nhất X" → operator: "lte" (less than or equal)
               - "bằng X", "đúng X", "chính xác X" → operator: "eq" (equal)
            
            5. **XỬ LÝ MIN/MAX**:
               - "cao nhất", "tốt nhất", "mạnh nhất" → sort order: "desc"
               - "thấp nhất", "rẻ nhất", "nhẹ nhất" → sort order: "asc"
               - Không cần conditions cho min/max, chỉ cần sort_fields
            
            6. **KEYWORDS QUAN TRỌNG**:
               - text_search_keywords: các từ khóa quan trọng để tìm kiếm full-text
               - text_search_fields: thường là ["productName", "description"] + related fields
            
            VÍ DỤ:
            
            Input: "laptop gaming RAM 16GB RTX 4070 SSD 1TB"
            Output: {
                "conditions": [
                    {"field": "ram", "operator": "gte", "value": "16", "type": "number", "is_array": false},
                    {"field": "graphicCard", "operator": "regex", "value": "RTX 4070", "type": "string", "is_array": false},
                    {"field": "storage", "operator": "elemMatch", "value": "1TB SSD", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description", "graphicCard"],
                "text_search_keywords": ["gaming", "16GB", "RTX", "4070", "1TB", "SSD"]
            }
            
            Input: "laptop pin cao nhất"
            Output: {
                "conditions": [],
                "sort_fields": [
                    {"field": "battery", "order": "desc", "priority": 1}
                ],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["pin", "cao nhất", "battery"]
            }
            
            Input: "điện thoại camera 108MP chip Snapdragon pin 5000mAh"
            Output: {
                "conditions": [
                    {"field": "rearCameraResolution", "operator": "gte", "value": "108", "type": "number", "is_array": false},
                    {"field": "processor", "operator": "regex", "value": "Snapdragon", "type": "string", "is_array": false},
                    {"field": "batteryCapacity", "operator": "gte", "value": "5000", "type": "number", "is_array": false}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description", "processor"],
                "text_search_keywords": ["108MP", "Snapdragon", "5000mAh", "camera", "chip", "pin"]
            }
            
            Input: "điện thoại pin lớn hơn 6000 mAh"
            Output: {
                "conditions": [
                    {"field": "batteryCapacity", "operator": "gt", "value": "6000", "type": "number", "is_array": false}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["pin", "lớn hơn", "6000", "mAh"]
            }
            
            Input: "điện thoại pin từ 4000 mAh trở lên"
            Output: {
                "conditions": [
                    {"field": "batteryCapacity", "operator": "gte", "value": "4000", "type": "number", "is_array": false}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["pin", "từ", "4000", "mAh", "trở lên"]
            }
            
            Input: "tai nghe không dây pin 8 giờ chống nước Bluetooth 5.3"
            Output: {
                "conditions": [
                    {"field": "batteryLife", "operator": "gte", "value": "8", "type": "number", "is_array": false},
                    {"field": "features", "operator": "elemMatch", "value": "chống nước", "type": "string", "is_array": true},
                    {"field": "connectionTechnology", "operator": "elemMatch", "value": "Bluetooth 5.3", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["không dây", "8 giờ", "chống nước", "Bluetooth", "5.3"]
            }
            
            Input: "sạc dự phòng 20000mAh sạc nhanh PD USB-C"
            Output: {
                "conditions": [
                    {"field": "batteryCapacity", "operator": "gte", "value": "20000", "type": "number", "is_array": false},
                    {"field": "technologyFeatures", "operator": "elemMatch", "value": "sạc nhanh", "type": "string", "is_array": true},
                    {"field": "technologyFeatures", "operator": "elemMatch", "value": "PD", "type": "string", "is_array": true},
                    {"field": "output", "operator": "elemMatch", "value": "USB-C", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["20000mAh", "sạc nhanh", "PD", "USB-C"]
            }
            
            Input: "tai nghe chụp tai pin 50 giờ có mic noise cancelling"
            Output: {
                "conditions": [
                    {"field": "batteryLife", "operator": "regex", "value": "50", "type": "string", "is_array": false},
                    {"field": "features", "operator": "elemMatch", "value": "mic", "type": "string", "is_array": true},
                    {"field": "features", "operator": "elemMatch", "value": "noise cancelling", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["chụp tai", "50 giờ", "mic", "noise cancelling"]
            }
            
            Input: "tai nghe có dây jack 3.5mm có mic tương thích điện thoại"
            Output: {
                "conditions": [
                    {"field": "audioJack", "operator": "regex", "value": "3.5mm", "type": "string", "is_array": false},
                    {"field": "features", "operator": "elemMatch", "value": "mic", "type": "string", "is_array": true},
                    {"field": "compatibility", "operator": "elemMatch", "value": "điện thoại", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["có dây", "3.5mm", "mic", "tương thích"]
            }
            
            Trả về CHỈ JSON hợp lệ theo định dạng chính xác này:
            {
                "conditions": [
                    {
                        "field": "tên_trường",
                        "operator": "eq|gte|lte|gt|lt|regex|in|elemMatch",
                        "value": "giá_trị_tìm_kiếm",
                        "type": "string|number|array",
                        "is_array": true/false
                    }
                ],
                "sort_fields": [
                    {
                        "field": "tên_trường",
                        "order": "desc|asc",
                        "priority": 1
                    }
                ],
                "text_search_fields": ["trường1", "trường2"],
                "text_search_keywords": ["từ_khóa1", "từ_khóa2"]
            }
            """, deviceType, query, deviceType, deviceFields, deviceType.toUpperCase());
    }

    private int calculateSimilarity(String productName, String query) {
        return StringUtils.getLevenshteinDistance(
                productName.toLowerCase(),
                query.toLowerCase()
        );
    }

    private String normalizeSearchQuery(String query) {
        query = query.replaceAll("[^a-zA-Z0-9\\s]", "");
        query = query.trim().replaceAll("\\s+", " ");
        return query;
    }

    public List<GroupDto> searchProducts(String query) {
        String processedQuery = normalizeSearchQuery(query);
        List<Object[]> results = groupRepository.findByGroupNameContainingWithFirstProduct(processedQuery);

        return results.stream()
                .map(this::convertToSearchDTO)
                .sorted(Comparator.comparingInt(dto -> 
                        calculateSimilarity(dto.getGroupName(), processedQuery)))
                .collect(Collectors.toList());
    }

    private GroupDto convertToSearchDTO(Object[] result) {
        Group group = (Group) result[0];
        GroupProduct firstProduct = result.length > 1 && result[1] != null ? (GroupProduct) result[1] : null;

        Double originalPrice = null;
        Double currentPrice = null;
        
        if (firstProduct != null && firstProduct.getDefaultOriginalPrice() != null) {
            originalPrice = firstProduct.getDefaultOriginalPrice().doubleValue();
        }
        
        if (firstProduct != null && firstProduct.getDefaultCurrentPrice() != null) {
            currentPrice = firstProduct.getDefaultCurrentPrice().doubleValue();
        }

        return GroupDto.builder()
                .groupId(group.getGroupId())
                .groupName(group.getGroupName())
                .brand(group.getBrand())
                .type(group.getType())
                .image(group.getImage())
                .orderNumber(group.getOrderNumber())
                .productId(firstProduct != null ? firstProduct.getProductId() : null)
                .defaultOriginalPrice(originalPrice)
                .defaultCurrentPrice(currentPrice)
                .build();
    }

    @Transactional(readOnly = true)
    public List<GroupWithProductsDto> getAllProductsByGroup(int page, int size, String type,
                                                            List<String> tags, List<String> brands,
                                                            String sortByPrice, Integer minPrice,
                                                            Integer maxPrice, String searchQuery) {
        try {
            // Create final variables to avoid lambda expression issues
            final Integer finalMinPrice = minPrice;
            final Integer finalMaxPrice = maxPrice;
            final String finalSearchQuery = searchQuery;
            
            List<Group> allGroups;
            final Map<Integer, Float> groupScores;
            final Set<Integer> relevantGroupIds;
            final List<String> smartSearchProductIds; // **THÊM ĐỂ GIỮ THỨ TỰ**
            
            // 1. Nếu có search query, tìm relevant group IDs trước
            if (finalSearchQuery != null && !finalSearchQuery.isEmpty()) {
                // Thực hiện smart search
                MongoSearchResult searchResult = smartSearchProducts(finalSearchQuery, type != null ? type : "laptop", 1000);
                
                if (searchResult.isSuccess()) {
                    smartSearchProductIds = searchResult.getProductIds(); // **LƯU THỨ TỰ ĐÃ SORT**
                    log.info("Smart search found {} product IDs in sorted order", smartSearchProductIds.size());
                    
                    if (smartSearchProductIds.isEmpty()) {
                        log.info("No products found for search query: {}", finalSearchQuery);
                        return Collections.emptyList();
                    }
                    
                    // Lấy group IDs từ các product IDs tìm được
                    List<GroupProduct> groupProducts = groupProductRepository.findAllByProductIdIn(smartSearchProductIds);
                    relevantGroupIds = groupProducts.stream()
                        .map(GroupProduct::getGroupId)
                        .collect(Collectors.toSet());
                    
                    log.info("Found {} relevant group IDs from search results", relevantGroupIds.size());
                    
                    if (relevantGroupIds.isEmpty()) {
                        log.info("No groups found for the searched products");
                        return Collections.emptyList();
                    }
                    
                    // Tính scores cho các groups này - **GIỮ THỨ TỰ TỪ SMART SEARCH**
                    groupScores = getGroupScoresFromSearchResultsWithOrder(smartSearchProductIds, new ArrayList<>(relevantGroupIds));
                    
                } else {
                    log.warn("Smart search failed: {}", searchResult.getError());
                    return Collections.emptyList();
                }
            } else {
                // Không có search query
                relevantGroupIds = null;
                groupScores = new HashMap<>();
                smartSearchProductIds = Collections.emptyList();
            }
            
            // 2. Lấy tất cả groups theo filter conditions
            if (type != null && !type.isEmpty()) {
                if (!tags.isEmpty() && !brands.isEmpty()) {
                    allGroups = groupRepository.findByTypeAndAllTagsAndBrands(type, tags, (long) tags.size(), brands);
                } else if (!tags.isEmpty()) {
                    allGroups = groupRepository.findByTypeAndAllTags(type, tags, (long) tags.size());
                } else if (!brands.isEmpty()) {
                    allGroups = groupRepository.findByTypeAndBrands(type, brands);
                } else {
                    allGroups = groupRepository.findAllByType(type);
                }
            } else {
                if (!tags.isEmpty() && !brands.isEmpty()) {
                    allGroups = groupRepository.findByAllTagsAndBrands(tags, (long) tags.size(), brands);
                } else if (!tags.isEmpty()) {
                    allGroups = groupRepository.findByAllTags(tags, (long) tags.size());
                } else if (!brands.isEmpty()) {
                    allGroups = groupRepository.findByBrands(brands);
                } else {
                    allGroups = groupRepository.findAll();
                }
            }

            // 3. Nếu có search query, filter groups theo relevant group IDs
            if (relevantGroupIds != null && !relevantGroupIds.isEmpty()) {
                allGroups = allGroups.stream()
                    .filter(group -> relevantGroupIds.contains(group.getGroupId()))
                    .collect(Collectors.toList());
                    
                log.info("After filtering by search results: {} groups remaining", allGroups.size());
            }

            if (allGroups.isEmpty()) {
                log.info("No groups found for type={}, tags={}, brands={}, search={}", type, tags, brands, finalSearchQuery);
                return Collections.emptyList();
            }

            // 4. Get all products and group by groupId
            Map<Integer, List<GroupProduct>> productsByGroup = groupProductRepository
                    .findAllByGroupIdInOrderByOrderNumberAsc(
                            allGroups.stream().map(Group::getGroupId).collect(Collectors.toList()))
                    .stream()
                    .collect(Collectors.groupingBy(GroupProduct::getGroupId));

            // 5. Build final result với price filtering
            List<GroupWithProductsDto> result = allGroups.stream()
                    .map(group -> {
                        final Group currentGroup = group;
                        final Integer currentGroupId = currentGroup.getGroupId();
                        
                        List<GroupProduct> filteredProducts = productsByGroup
                                .getOrDefault(currentGroupId, Collections.emptyList())
                                .stream()
                                .filter(p -> p.getDefaultCurrentPrice() != null)
                                .filter(p -> finalMinPrice == null || p.getDefaultCurrentPrice() >= finalMinPrice)
                                .filter(p -> finalMaxPrice == null || p.getDefaultCurrentPrice() <= finalMaxPrice)
                                .collect(Collectors.toList());

                        if (filteredProducts.isEmpty()) {
                            return null;
                        }

                        return GroupWithProductsDto.builder()
                                .groupDto(GroupDto.builder()
                                        .groupName(currentGroup.getGroupName())
                                        .groupId(currentGroupId)
                                        .orderNumber(currentGroup.getOrderNumber())
                                        .image(currentGroup.getImage())
                                        .type(currentGroup.getType())
                                        .brand(currentGroup.getBrand())
                                        .build())
                                .products(filteredProducts.stream()
                                        .map(gp -> GroupProductDto.builder()
                                                .productId(gp.getProductId())
                                                .variant(gp.getVariant())
                                                .productName(gp.getProductName())
                                                .defaultOriginalPrice(gp.getDefaultOriginalPrice())
                                                .defaultCurrentPrice(gp.getDefaultCurrentPrice())
                                                .defaultColor(gp.getDefaultColor())
                                                .orderNumber(gp.getOrderNumber())
                                                .build())
                                        .collect(Collectors.toList()))
                                .elasticsearchScore(groupScores.getOrDefault(currentGroupId, 0f))
                                .build();
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            // 6. **QUAN TRỌNG: Sort results theo thứ tự từ smart search**
            result.sort((g1, g2) -> {
                if (finalSearchQuery != null && !finalSearchQuery.isEmpty() && !smartSearchProductIds.isEmpty()) {
                    // **SẮP XẾP THEO THỨ TỰ CỦA SMART SEARCH**
                    Float score1 = g1.getElasticsearchScore();
                    Float score2 = g2.getElasticsearchScore();
                    
                    // Nếu có smart search results, ưu tiên sort theo smart search order
                    int smartSearchCompare = Float.compare(score2, score1);
                    if (smartSearchCompare != 0) {
                        return smartSearchCompare;
                    }
                    
                    // **FALLBACK: Sort theo thứ tự product đầu tiên xuất hiện trong smartSearchProductIds**
                    Integer group1FirstProductIndex = getFirstProductIndexInSmartSearch(g1, smartSearchProductIds);
                    Integer group2FirstProductIndex = getFirstProductIndexInSmartSearch(g2, smartSearchProductIds);
                    
                    if (group1FirstProductIndex != null && group2FirstProductIndex != null) {
                        return Integer.compare(group1FirstProductIndex, group2FirstProductIndex);
                    } else if (group1FirstProductIndex != null) {
                        return -1; // g1 có trong smart search, g2 không có
                    } else if (group2FirstProductIndex != null) {
                        return 1;  // g2 có trong smart search, g1 không có
                    }
                }
                
                // Sort theo price nếu không có search hoặc score bằng nhau
                if ("asc".equalsIgnoreCase(sortByPrice)) {
                    return compareByPrice(g1, g2, false);
                } else if ("desc".equalsIgnoreCase(sortByPrice)) {
                    return compareByPrice(g1, g2, true);
                }
                
                return 0;
            });

            // 7. Pagination
            int start = page * size;
            int end = Math.min(start + size, result.size());
            List<GroupWithProductsDto> paginatedResult = result.subList(start, end);

            log.info("Fetched {} groups (out of {}) for type: {}, tags: {}, brands: {}, search: {} (smart search order preserved: {})",
                    paginatedResult.size(), result.size(),
                    type != null ? type : "all", tags, brands, finalSearchQuery, !smartSearchProductIds.isEmpty());

            return paginatedResult;
        } catch (Exception e) {
            log.error("Error in getAllProductsByGroup: ", e);
            throw new ServiceException("Failed to retrieve products by group", e);
        }
    }

    // **THÊM METHOD HELPER**
    private Integer getFirstProductIndexInSmartSearch(GroupWithProductsDto group, List<String> smartSearchProductIds) {
        if (smartSearchProductIds.isEmpty()) {
            return null;
        }
        
        for (GroupProductDto product : group.getProducts()) {
            int index = smartSearchProductIds.indexOf(product.getProductId());
            if (index >= 0) {
                return index;
            }
        }
        return null;
    }

    // **UPDATE METHOD SCORES**  
    private Map<Integer, Float> getGroupScoresFromSearchResultsWithOrder(List<String> foundProductIds, List<Integer> groupIds) {
        Map<Integer, Float> groupScores = new HashMap<>();
        
        // Get group mappings for found products
        List<GroupProduct> groupProducts = groupProductRepository.findAllByProductIdIn(foundProductIds);
        
        // **TÍNH SCORE DỰA TRÊN THỨ TỰ TRONG SMART SEARCH**
        Map<Integer, Integer> groupFirstIndex = new HashMap<>();
        
        for (GroupProduct gp : groupProducts) {
            if (groupIds.contains(gp.getGroupId())) {
                int productIndex = foundProductIds.indexOf(gp.getProductId());
                if (productIndex >= 0) {
                    // Lưu index nhỏ nhất (product đầu tiên) của mỗi group
                    groupFirstIndex.merge(gp.getGroupId(), productIndex, Integer::min);
                }
            }
        }
        
        // Convert index thành score (index nhỏ hơn = score cao hơn)
        int maxIndex = foundProductIds.size();
        groupFirstIndex.forEach((groupId, firstIndex) -> {
            float score = (float) (maxIndex - firstIndex) / maxIndex;
            groupScores.put(groupId, score);
        });
        
        return groupScores;
    }

    private Map<Integer, Float> getGroupScoresFromSearchResults(List<String> foundProductIds, List<Integer> groupIds) {
        Map<Integer, Float> groupScores = new HashMap<>();
        
        // Get group mappings for found products
        List<GroupProduct> groupProducts = groupProductRepository.findAllByProductIdIn(foundProductIds);
        
        // Calculate scores based on how many products from each group were found
        Map<Integer, Long> groupProductCounts = groupProducts.stream()
            .filter(gp -> groupIds.contains(gp.getGroupId()))
            .collect(Collectors.groupingBy(GroupProduct::getGroupId, Collectors.counting()));
        
        // Normalize scores (simple approach: count / max_count)
        long maxCount = groupProductCounts.values().stream().mapToLong(Long::longValue).max().orElse(1L);
        
        groupProductCounts.forEach((groupId, count) -> 
            groupScores.put(groupId, (float) count / maxCount)
        );
        
        return groupScores;
    }

    private int compareByPrice(GroupWithProductsDto g1, GroupWithProductsDto g2, boolean descending) {
        Integer price1 = g1.getProducts().isEmpty() ? null : g1.getProducts().get(0).getDefaultCurrentPrice();
        Integer price2 = g2.getProducts().isEmpty() ? null : g2.getProducts().get(0).getDefaultCurrentPrice();

        if (price1 == null && price2 == null) return 0;
        if (price1 == null) return 1;
        if (price2 == null) return -1;

        return descending ? Double.compare(price2, price1) : Double.compare(price1, price2);
    }

    // [Rest of the existing methods remain unchanged]
    public GroupVariantResponseDto findAllProductsInSameGroup(String productId) {
        log.debug("Finding all products in same group (including current) for productId: {}", productId);

        GroupVariantResponseDto response = new GroupVariantResponseDto();
        Optional<Integer> groupIdOpt = groupProductRepository.findGroupIdByProductId(productId);

        if (groupIdOpt.isPresent()) {
            Integer groupId = groupIdOpt.get();
            log.debug("Found groupId: {} for productId: {}", groupId, productId);

            Optional<Group> groupOpt = groupRepository.findById(groupId);
            String groupName = groupOpt.map(Group::getGroupName).orElse(null);
            log.debug("Found groupName: {} for groupId: {}", groupName, groupId);

            response.setGroupId(groupId);
            response.setGroupName(groupName);

            List<GroupProduct> groupProducts = groupProductRepository.findAllByGroupIdOrderByOrderNumberAsc(groupId);
            log.debug("Found {} total products in group {}", groupProducts.size(), groupId);

            List<VariantDto> variants = groupProducts.stream()
                    .map(gp -> {
                        VariantDto dto = new VariantDto();
                        dto.setProductId(gp.getProductId());
                        dto.setVariant(gp.getVariant());
                        return dto;
                    })
                    .collect(Collectors.toList());

            response.setVariants(variants);
            return response;
        } else {
            log.debug("No group found for productId: {}", productId);
            response.setVariants(new ArrayList<>());
            return response;
        }
    }

    @Transactional
    public Integer createGroupAndAssignProducts(List<String> productIds, Integer orderNumber, String image, String type,
                                               List<String> variants, List<String> productNames, List<Integer> defaultOriginalPrices,
                                               List<Integer> defaultCurrentPrices, List<String> defaultColors,
                                               String groupName, String brand) {
        log.debug("Creating group and assigning products. ProductIds: {}, orderNumber: {}, type: {}",
                productIds, orderNumber, type);

        if (productIds == null || productIds.isEmpty()) {
            log.warn("Product IDs list is empty or null");
            throw new IllegalArgumentException("Product IDs list cannot be empty");
        }

        if (orderNumber == null) {
            log.debug("orderNumber is null, finding max orderNumber for type: {}", type);
            Integer maxOrderNumber = groupRepository.findMaxOrderNumberByType(type);
            orderNumber = (maxOrderNumber != null) ? maxOrderNumber + 1 : 1;
            log.debug("Using new orderNumber: {} (based on max: {})", orderNumber, maxOrderNumber);
        }

        log.debug("Building new Group entity");
        Group newGroup = Group.builder()
                .orderNumber(orderNumber)
                .image(image)
                .type(type)
                .groupName(groupName)
                .brand(brand)
                .build();

        log.debug("Saving Group entity to database");
        Group savedGroup = groupRepository.save(newGroup);
        Integer groupId = savedGroup.getGroupId();
        log.debug("Saved Group with ID: {}", groupId);

        log.debug("Creating GroupProduct entries for {} products", productIds.size());
        for (int i = 0; i < productIds.size(); i++) {
            String productId = productIds.get(i);
            log.debug("Creating GroupProduct for productId: {} with order: {}", productId, i + 1);

            GroupProduct groupProduct = GroupProduct.builder()
                    .groupId(groupId)
                    .productId(productId)
                    .variant(variants.get(i))
                    .productName(productNames.get(i))
                    .defaultOriginalPrice(defaultOriginalPrices.get(i))
                    .defaultCurrentPrice(defaultCurrentPrices.get(i))
                    .defaultColor(defaultColors.get(i))
                    .orderNumber(i + 1)
                    .build();

            log.debug("Saving GroupProduct entity to database");
            GroupProduct savedGroupProduct = groupProductRepository.save(groupProduct);
            log.debug("Saved GroupProduct with ID: {}", savedGroupProduct.getGroupProductId());
        }

        log.debug("Successfully created group with ID: {} and assigned {} products", groupId, productIds.size());
        return groupId;
    }

    @Transactional
    public void updateGroupAndProducts(Integer groupId, List<String> productIds, List<String> variants,
                                       List<String> productNames, Integer orderNumber, String image, String type,
                                       List<Integer> defaultOriginalPrices, List<Integer> defaultCurrentPrices,
                                       List<String> defaultColors) {
        log.debug("Updating group {} and its products. ProductIds: {}", groupId, productIds);

        if (groupId == null) {
            throw new IllegalArgumentException("Group ID cannot be null");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group with ID " + groupId + " not found"));

        log.debug("Found existing group: {}", group);

        if (orderNumber != null) {
            group.setOrderNumber(orderNumber);
        }
        if (image != null) {
            group.setImage(image);
        }
        if (type != null) {
            group.setType(type);
        }

        log.debug("Saving updated group: {}", group);
        groupRepository.save(group);

        if (productIds != null) {
            log.debug("Deleting existing GroupProduct entries for group ID: {}", groupId);
            groupProductRepository.deleteAllByGroupId(groupId);

            if (!productIds.isEmpty()) {
                log.debug("Creating {} new GroupProduct entries", productIds.size());
                List<GroupProduct> newGroupProducts = new ArrayList<>();

                for (int i = 0; i < productIds.size(); i++) {
                    String productId = productIds.get(i);
                    String variant = (variants != null && i < variants.size()) ? variants.get(i) : null;

                    log.debug("Creating GroupProduct for productId: {} with order: {}, variant: {}",
                            productId, i + 1, variant);

                    GroupProduct groupProduct = GroupProduct.builder()
                            .groupId(groupId)
                            .productId(productId)
                            .variant(variant)
                            .productName(productNames.get(i))
                            .defaultOriginalPrice(defaultOriginalPrices.get(i))
                            .defaultCurrentPrice(defaultCurrentPrices.get(i))
                            .defaultColor(defaultColors.get(i))
                            .orderNumber(i + 1)
                            .build();

                    newGroupProducts.add(groupProduct);
                }

                groupProductRepository.saveAll(newGroupProducts);
                log.debug("Saved {} new GroupProduct entries", newGroupProducts.size());
            }
        }

        log.debug("Successfully updated group ID: {} with {} products", groupId,
                productIds != null ? productIds.size() : "unchanged");
    }

    public Group updateGroupPriority(Integer groupId, Integer orderNumber) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with id: " + groupId));

        group.setOrderNumber(orderNumber);
        return groupRepository.save(group);
    }

    private InventoryDto convertToDto(ProductInventory inventory) {
        if (inventory == null) {
            return null;
        }

        return InventoryDto.builder()
                .inventoryId(inventory.getInventoryId())
                .productId(inventory.getProductId())
                .productName(inventory.getProductName())
                .color(inventory.getColor())
                .quantity(inventory.getQuantity())
                .originalPrice(inventory.getOriginalPrice())
                .currentPrice(inventory.getCurrentPrice())
                .build();
    }

    public void deleteByGroupId(Integer groupId) {
        try {
            List<GroupProduct> groupProducts = groupProductRepository.findByGroupId(groupId);
            if (!groupProducts.isEmpty()) {
                groupProductRepository.deleteAll(groupProducts);
                log.info("Deleted {} group-product links for group ID: {}", groupProducts.size(), groupId);
            } else {
                log.info("No group-product junctions found for group ID: {}", groupId);
            }
            
            if (groupRepository.existsById(groupId)) {
                groupRepository.deleteById(groupId);
                log.info("Successfully deleted group entity with ID: {}", groupId);
            } else {
                log.warn("Group with ID {} not found in groups table", groupId);
            }
            
        } catch (Exception e) {
            log.error("Error deleting group and junctions for group ID {}: {}", groupId, e.getMessage());
            throw new RuntimeException("Failed to delete group and junctions for group: " + groupId, e);
        }
    }

    public void deleteByProductId(String productId) {
        try {
            List<GroupProduct> groupProducts = groupProductRepository.findByProductId(productId);
            if (!groupProducts.isEmpty()) {
                groupProductRepository.deleteAll(groupProducts);
                log.info("Deleted {} group-product links for product ID: {}", groupProducts.size(), productId);
            }
        } catch (Exception e) {
            log.error("Error deleting group-product links for product ID {}: {}", productId, e.getMessage());
            throw new RuntimeException("Failed to delete group-product links for product: " + productId, e);
        }
    }

    public List<String> getProductIdsByGroupId(Integer groupId) {
        try {
            List<GroupProduct> groupProducts = groupProductRepository.findByGroupId(groupId);
            return groupProducts.stream()
                    .map(GroupProduct::getProductId)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting product IDs for group ID {}: {}", groupId, e.getMessage());
            throw new RuntimeException("Failed to get product IDs for group: " + groupId, e);
        }
    }
}