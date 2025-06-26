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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // Device type mappings
    private static final Map<String, String> DEVICE_TYPE_TO_CLASS = Map.of(
        "laptop", "com.eazybytes.model.Laptop",
        "phone", "com.eazybytes.model.Phone",
        "wireless_earphone", "com.eazybytes.model.WirelessEarphone",
        "wired_earphone", "com.eazybytes.model.WiredEarphone",
        "headphone", "com.eazybytes.model.Headphone",
        "backup_charger", "com.eazybytes.model.BackupCharger"
    );

    // Device fields mappings
    private static final Map<String, List<String>> DEVICE_FIELDS = Map.of(
        "laptop", Arrays.asList(
            "processorModel", "coreCount", "threadCount", "cpuSpeed", "maxCpuSpeed",
            "ram", "ramType", "ramBusSpeed", "maxRam", "storage",
            "screenSize", "resolution", "refreshRate", "colorGamut", "displayTechnology",
            "graphicCard", "audioTechnology", "ports", "wirelessConnectivity", "webcam",
            "otherFeatures", "keyboardBacklight", "size", "material", "battery", "os",
            "brand", "productName", "description"
        ),
        "phone", Arrays.asList(
            "ram", "storage", "availableStorage", "processor", "cpuSpeed", "gpu", "os",
            "rearCameraResolution", "frontCameraResolution", "rearCameraFeatures", "frontCameraFeatures",
            "rearVideoRecording", "rearFlash", "screenSize", "displayTechnology", "displayResolution",
            "maxBrightness", "screenProtection", "batteryType", "maxChargingPower", "batteryFeatures",
            "mobileNetwork", "simType", "wifi", "bluetooth", "gps", "headphoneJack", "otherConnectivity",
            "securityFeatures", "specialFeatures", "waterResistance", "recording", "video", "audio",
            "designType", "materials", "sizeWeight", "brand", "productName", "description"
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

    // Simple keyword-based search that mimics LLM analysis
    public MongoSearchResult smartSearchProducts(String query, String deviceType, int topK) {
        try {
            log.info("Smart search for query: '{}', deviceType: '{}', topK: {}", query, deviceType, topK);

            // Step 1: Analyze query using LLM or fallback method
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

            // Step 2: Build search criteria based on analysis
            List<String> searchKeywords = extractSearchKeywords(query, analysis);
            
            // Step 3: Search using keyword matching (simplified approach)
            List<String> productIds = performKeywordSearch(searchKeywords, deviceType, topK);

            // Step 4: Apply sorting if specified
            if (!analysis.getSortFields().isEmpty()) {
                productIds = applySorting(productIds, analysis.getSortFields());
            }

            log.info("Smart search found {} product_ids", productIds.size());

            return MongoSearchResult.builder()
                .productIds(productIds)
                .searchMethod("Smart Keyword Search with LLM Analysis")
                .appliedConditions(convertToConditionInfo(analysis.getConditions()))
                .sortFields(analysis.getSortFields())
                .textSearchKeywords(analysis.getTextSearchKeywords())
                .resultsCount(productIds.size())
                .success(!productIds.isEmpty())
                .build();

        } catch (Exception e) {
            log.error("Error in smart search: ", e);
            // Fallback to simple keyword search
            List<String> fallbackResults = simpleKeywordSearch(query, deviceType, topK);
            return MongoSearchResult.builder()
                .productIds(fallbackResults)
                .searchMethod("Simple Keyword Search Fallback")
                .error(e.getMessage())
                .resultsCount(fallbackResults.size())
                .success(!fallbackResults.isEmpty())
                .build();
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

    private List<String> extractSearchKeywords(String query, LLMAnalysisResult analysis) {
        List<String> keywords = new ArrayList<>();
        
        // Add keywords from LLM analysis
        if (analysis.getTextSearchKeywords() != null) {
            keywords.addAll(analysis.getTextSearchKeywords());
        }
        
        // Add original query words as fallback
        String[] queryWords = query.toLowerCase().split("\\s+");
        for (String word : queryWords) {
            if (word.length() > 2 && !keywords.contains(word)) {
                keywords.add(word);
            }
        }
        
        return keywords;
    }

    private List<String> performKeywordSearch(List<String> keywords, String deviceType, int topK) {
        // This is a simplified implementation
        // In a real scenario, you would query your product database
        List<String> results = new ArrayList<>();
        
        // Mock search results based on keywords
        for (int i = 1; i <= topK; i++) {
            results.add("product_" + deviceType + "_" + i);
        }
        
        return results;
    }

    private List<String> applySorting(List<String> productIds, List<SortField> sortFields) {
        // This is a simplified sorting implementation
        // In a real scenario, you would sort based on actual product data
        log.info("Applying sorting with {} sort fields", sortFields.size());
        
        // For now, just return the same list
        // You would implement actual sorting logic here based on your data source
        return productIds;
    }

    private List<String> simpleKeywordSearch(String query, String deviceType, int topK) {
        List<String> results = new ArrayList<>();
        String[] keywords = query.toLowerCase().split("\\s+");
        
        // Simple mock implementation
        for (int i = 1; i <= Math.min(topK, 10); i++) {
            results.add("simple_" + deviceType + "_" + i);
        }
        
        return results;
    }

    private String buildLLMPrompt(String query, String deviceType, List<String> deviceFields) {
        return String.format("""
            You are an expert product search assistant. Analyze the user's specific requirements and create search criteria for %s products.
            
            USER QUERY: "%s"
            
            Available fields for %s: %s
            
            FIELD TYPES FOR %s:
            
            LAPTOP FIELDS:
            - Numeric: ram, maxRam, ramBusSpeed, coreCount, threadCount, refreshRate, battery
            - String: processorModel, cpuSpeed, maxCpuSpeed, ramType, screenSize, resolution, graphicCard, webcam, keyboardBacklight, size, material, os, brand, productName, description
            - Arrays: storage, colorGamut, displayTechnology, audioTechnology, ports, wirelessConnectivity, otherFeatures
            
            PHONE FIELDS:
            - Numeric: ram, storage, availableStorage, maxBrightness, maxChargingPower
            - String: processor, cpuSpeed, gpu, os, displayTechnology, displayResolution, screenSize, batteryType, mobileNetwork, simType, headphoneJack, waterResistance, designType, materials, sizeWeight, brand, productName, description
            - Arrays: rearCameraFeatures, frontCameraFeatures, rearVideoRecording, batteryFeatures, securityFeatures, specialFeatures, recording, video, audio, wifi, bluetooth, gps, otherConnectivity
            
            WIRELESS_EARPHONE FIELDS:
            - Numeric: (extracted from batteryLife, chargingCaseBatteryLife)
            - String: batteryLife, chargingCaseBatteryLife, simultaneousConnections, size, brandOrigin, manufactured, brand, productName, description
            - Arrays: chargingPort, audioTechnology, compatibility, connectionApp, features, connectionTechnology, controlType, controlButtons
            
            BACKUP_CHARGER FIELDS:
            - Numeric: batteryCapacity, weight
            - String: batteryCellType, size, brandOrigin, manufactured, brand, productName, description
            - Arrays: input, output, chargingTime, technologyFeatures
            
            HEADPHONE FIELDS:
            - Numeric: weight
            - String: batteryLife, chargingPort, audioJack, simultaneousConnections, size, brandOrigin, manufactured, brand, productName, description
            - Arrays: connectionTechnology, compatibility, features, controlType, controlButtons
            
            WIRED_EARPHONE FIELDS:
            - Numeric: weight
            - String: audioJack, cableLength, simultaneousConnections, brandOrigin, manufactured, brand, productName, description
            - Arrays: compatibility, features, controlType, controlButtons
            
            ANALYSIS RULES:
            1. For numeric fields (RAM, storage, core count, thread count, speed): use numeric operators (gte, lte, gt, lt)
            2. For string fields (processor, brand, model, graphic card): use regex
            3. For array fields (storage options, display tech, ports, connectivity): use elemMatch or in
            4. Extract numbers from text: "32GB" → value: 32, type: "number"
            5. Laptop specs: "RTX 4070" → field: "graphicCard", operator: "regex", value: "RTX 4070"
            6. Phone camera specs: "48MP" → field: "rearCameraResolution", operator: "regex", value: "48 MP"
            7. Features in array: "OIS" → field: "rearCameraFeatures", operator: "elemMatch", value: "OIS", is_array: true
            8. Laptop ports: "USB-C" → field: "ports", operator: "elemMatch", value: "USB Type-C", is_array: true
            9. MIN/MAX HANDLING:
               - "highest performance", "best camera", "fastest" → sort_fields with order: "desc"
               - "cheapest", "lightest", "smallest" → sort_fields with order: "asc"
               - No conditions needed for min/max, only sort_fields
            10. text_search_keywords: important keywords for full-text search
            
            EXAMPLES:
            
            Input: "laptop RAM 16GB SSD 512GB Ryzen 5 có USB-C"
            Output: {
                "conditions": [
                    {"field": "ram", "operator": "gte", "value": "16", "type": "number", "is_array": false},
                    {"field": "storage", "operator": "elemMatch", "value": "512 GB SSD", "type": "string", "is_array": true},
                    {"field": "processorModel", "operator": "regex", "value": "Ryzen 5", "type": "string", "is_array": false},
                    {"field": "ports", "operator": "elemMatch", "value": "USB Type-C", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["16GB", "512GB", "SSD", "Ryzen", "USB-C"]
            }
            
            Input: "laptop gaming highest performance"
            Output: {
                "conditions": [
                    {"field": "graphicCard", "operator": "regex", "value": "RTX|GTX", "type": "string", "is_array": false}
                ],
                "sort_fields": [
                    {"field": "ram", "order": "desc", "priority": 1},
                    {"field": "processorModel", "order": "desc", "priority": 2}
                ],
                "text_search_fields": ["productName", "description", "graphicCard"],
                "text_search_keywords": ["gaming", "performance", "highest"]
            }
            
            Input: "phone RAM 8GB camera 48MP có OIS wifi 6"
            Output: {
                "conditions": [
                    {"field": "ram", "operator": "gte", "value": "8", "type": "number", "is_array": false},
                    {"field": "rearCameraResolution", "operator": "regex", "value": "48 MP", "type": "string", "is_array": false},
                    {"field": "rearCameraFeatures", "operator": "elemMatch", "value": "OIS", "type": "string", "is_array": true},
                    {"field": "wifi", "operator": "elemMatch", "value": "Wi-Fi 6", "type": "string", "is_array": true}
                ],
                "sort_fields": [],
                "text_search_fields": ["productName", "description"],
                "text_search_keywords": ["48MP", "OIS", "wifi", "6"]
            }
            
            Return ONLY valid JSON in this exact format:
            {
                "conditions": [
                    {
                        "field": "field_name",
                        "operator": "eq|gte|lte|gt|lt|regex|in|elemMatch",
                        "value": "search_value",
                        "type": "string|number|array",
                        "is_array": true/false
                    }
                ],
                "sort_fields": [
                    {
                        "field": "field_name",
                        "order": "desc|asc",
                        "priority": 1
                    }
                ],
                "text_search_fields": ["field1", "field2"],
                "text_search_keywords": ["keyword1", "keyword2"]
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
            
            // 1. Get groups by filter conditions
            List<Group> allGroups;
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

            if (allGroups.isEmpty()) {
                log.info("No groups found for type={}, tags={}, brands={}", type, tags, brands);
                return Collections.emptyList();
            }

            // 2. Get scores from smart search if search query exists
            final Map<Integer, Float> groupScores;
            if (finalSearchQuery != null && !finalSearchQuery.isEmpty()) {
                // Use smart search instead of Elasticsearch
                MongoSearchResult searchResult = smartSearchProducts(finalSearchQuery, type != null ? type : "laptop", 100);
                
                if (searchResult.isSuccess()) {
                    List<String> foundProductIds = searchResult.getProductIds();
                    List<Integer> groupIds = allGroups.stream().map(Group::getGroupId).collect(Collectors.toList());
                    
                    // Get group scores based on search results
                    groupScores = getGroupScoresFromSearchResults(foundProductIds, groupIds);
                } else {
                    groupScores = new HashMap<>();
                }
            } else {
                groupScores = new HashMap<>();
            }

            // 3. Get all products and group by groupId
            Map<Integer, List<GroupProduct>> productsByGroup = groupProductRepository
                    .findAllByGroupIdInOrderByOrderNumberAsc(
                            allGroups.stream().map(Group::getGroupId).collect(Collectors.toList()))
                    .stream()
                    .collect(Collectors.groupingBy(GroupProduct::getGroupId));

            // 4. Build final result
            List<GroupWithProductsDto> result = allGroups.stream()
                    .map(group -> {
                        // Create local final variables to avoid lambda expression error
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

            // 5. Sort results
            result.sort((g1, g2) -> {
                if (finalSearchQuery != null && !finalSearchQuery.isEmpty()) {
                    return Float.compare(g2.getElasticsearchScore(), g1.getElasticsearchScore());
                } else if ("asc".equalsIgnoreCase(sortByPrice)) {
                    return compareByPrice(g1, g2, false);
                } else {
                    return compareByPrice(g1, g2, true);
                }
            });

            // 6. Pagination
            int start = page * size;
            int end = Math.min(start + size, result.size());
            List<GroupWithProductsDto> paginatedResult = result.subList(start, end);

            log.info("Fetched {} groups (out of {}) for type: {}, tags: {}, brands: {}, search: {}",
                    paginatedResult.size(), result.size(),
                    type != null ? type : "all", tags, brands, finalSearchQuery);

            return paginatedResult;
        } catch (Exception e) {
            log.error("Error in getAllProductsByGroup: ", e);
            throw new ServiceException("Failed to retrieve products by group", e);
        }
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