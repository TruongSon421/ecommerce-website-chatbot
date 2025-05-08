package com.eazybytes.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.core.SearchRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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
    private ElasticsearchService elasticsearchService;

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    private int calculateSimilarity(String productName, String query) {
        // Sử dụng Levenshtein distance để đo độ tương đồng
        return StringUtils.getLevenshteinDistance(
                productName.toLowerCase(),
                query.toLowerCase()
        );
    }

    private String normalizeSearchQuery(String query) {
        // Loại bỏ ký tự đặc biệt
        query = query.replaceAll("[^a-zA-Z0-9\\s]", "");

        // Loại bỏ khoảng trắng thừa
        query = query.trim().replaceAll("\\s+", " ");

        return query;
    }

    public List<GroupProductDto> searchProducts(String query) {

        String processedQuery = normalizeSearchQuery(query);

        List<GroupProduct> products = groupProductRepository
                .findUniqueProductsByNameGrouped(processedQuery);

        return products.stream()
                .map(this::convertToSearchDTO)
                .sorted(Comparator.comparingInt(dto ->
                        calculateSimilarity(dto.getProductName(), processedQuery)
                ))
                .collect(Collectors.toList());
    }

    private GroupProductDto convertToSearchDTO(GroupProduct product) {
        GroupProductDto dto = new GroupProductDto();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setDefaultOriginalPrice(product.getDefaultOriginalPrice());
        dto.setDefaultCurrentPrice(product.getDefaultCurrentPrice());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<GroupWithProductsDto> getAllProductsByGroup(int page, int size, String type,
                                                            List<String> tags, List<String> brands,
                                                            String sortByPrice, Integer minPrice,
                                                            Integer maxPrice, String searchQuery) {
        try {
            // 1. Lấy danh sách group theo điều kiện lọc
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

            // 2. Lấy scores từ Elasticsearch nếu có search query
            Map<Integer, Float> groupScores = (searchQuery != null && !searchQuery.isEmpty())
                    ? elasticsearchService.getGroupScoresFromElasticsearch(
                    searchQuery,
                    allGroups.stream().map(Group::getGroupId).collect(Collectors.toList()))
                    : Collections.emptyMap();

            // 3. Lấy tất cả products và nhóm theo groupId
            Map<Integer, List<GroupProduct>> productsByGroup = groupProductRepository
                    .findAllByGroupIdInOrderByOrderNumberAsc(
                            allGroups.stream().map(Group::getGroupId).collect(Collectors.toList()))
                    .stream()
                    .collect(Collectors.groupingBy(GroupProduct::getGroupId));

            // 4. Xây dựng kết quả cuối cùng
            List<GroupWithProductsDto> result = allGroups.stream()
                    .map(group -> {
                        List<GroupProduct> filteredProducts = productsByGroup
                                .getOrDefault(group.getGroupId(), Collections.emptyList())
                                .stream()
                                .filter(p -> p.getDefaultCurrentPrice() != null)
                                .filter(p -> minPrice == null || p.getDefaultCurrentPrice() >= minPrice)
                                .filter(p -> maxPrice == null || p.getDefaultCurrentPrice() <= maxPrice)
                                .collect(Collectors.toList());

                        if (filteredProducts.isEmpty()) {
                            return null;
                        }

                        return GroupWithProductsDto.builder()
                                .groupDto(GroupDto.builder()
                                        .groupName(group.getGroupName())
                                        .groupId(group.getGroupId())
                                        .orderNumber(group.getOrderNumber())
                                        .image(group.getImage())
                                        .type(group.getType())
                                        .brand(group.getBrand())
                                        .build())
                                .products(filteredProducts.stream()
                                        .map(gp -> GroupProductDto.builder()
                                                .productId(gp.getProductId())
                                                .variant(gp.getVariant())
                                                .productName(gp.getProductName())
                                                .defaultOriginalPrice(gp.getDefaultOriginalPrice())
                                                .defaultCurrentPrice(gp.getDefaultCurrentPrice())
                                                .orderNumber(gp.getOrderNumber())
                                                .build())
                                        .collect(Collectors.toList()))
                                .elasticsearchScore(groupScores.getOrDefault(group.getGroupId(), 0f))
                                .build();
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            // 5. Sắp xếp kết quả
            result.sort((g1, g2) -> {
                if (searchQuery != null && !searchQuery.isEmpty()) {
                    return Float.compare(g2.getElasticsearchScore(), g1.getElasticsearchScore());
                } else if ("asc".equalsIgnoreCase(sortByPrice)) {
                    return compareByPrice(g1, g2, false);
                } else {
                    return compareByPrice(g1, g2, true);
                }
            });

            // 6. Phân trang
            int start = page * size;
            int end = Math.min(start + size, result.size());
            List<GroupWithProductsDto> paginatedResult = result.subList(start, end);

            log.info("Fetched {} groups (out of {}) for type: {}, tags: {}, brands: {}, search: {}",
                    paginatedResult.size(), result.size(),
                    type != null ? type : "all", tags, brands, searchQuery);

            return paginatedResult;
        } catch (Exception e) {
            log.error("Error in getAllProductsByGroup: ", e);
            throw new ServiceException("Failed to retrieve products by group", e);
        }
    }

    private int compareByPrice(GroupWithProductsDto g1, GroupWithProductsDto g2, boolean descending) {
        Integer price1 = g1.getProducts().isEmpty() ? null : g1.getProducts().get(0).getDefaultCurrentPrice();
        Integer price2 = g2.getProducts().isEmpty() ? null : g2.getProducts().get(0).getDefaultCurrentPrice();

        if (price1 == null && price2 == null) return 0;
        if (price1 == null) return 1;
        if (price2 == null) return -1;

        return descending ? Double.compare(price2, price1) : Double.compare(price1, price2);
    }

    public List<VariantDto> findAllProductsInSameGroup(String productId) {
        log.debug("Finding all products in same group (including current) for productId: {}", productId);

        // Find groupId from GroupProduct
        Optional<Integer> groupIdOpt = groupProductRepository.findGroupIdByProductId(productId);

        if (groupIdOpt.isPresent()) {
            Integer groupId = groupIdOpt.get();
            log.debug("Found groupId: {} for productId: {}", groupId, productId);

            // Get all GroupProduct entries for this group
            List<GroupProduct> groupProducts = groupProductRepository.findAllByGroupIdOrderByOrderNumberAsc(groupId);
            log.debug("Found {} total products in group {}", groupProducts.size(), groupId);

            // Map GroupProduct entries to VariantDto
            List<VariantDto> variants = groupProducts.stream()
                    .map(gp -> {
                        VariantDto dto = new VariantDto();
                        dto.setProductId(gp.getProductId());
                        dto.setVariant(gp.getVariant());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return variants;
        } else {
            log.debug("No group found for productId: {}", productId);
            return new ArrayList<>();
        }
    }

    @Transactional
    public Integer createGroupAndAssignProducts(List<String> productIds, Integer orderNumber, String image, String type,List<String> variants,List<String> productNames,List<Integer> defaultOriginalPrices, List<Integer> defaultCurrentPrices,String groupName,String brand) {
        log.debug("Creating group and assigning products. ProductIds: {}, orderNumber: {}, type: {}",
                productIds, orderNumber, type);

        if (productIds == null || productIds.isEmpty()) {
            log.warn("Product IDs list is empty or null");
            throw new IllegalArgumentException("Product IDs list cannot be empty");
        }

        // Xử lý orderNumber nếu null
        if (orderNumber == null) {
            log.debug("orderNumber is null, finding max orderNumber for type: {}", type);
            // Lấy orderNumber cao nhất của cùng type
            Integer maxOrderNumber = groupRepository.findMaxOrderNumberByType(type);
            orderNumber = (maxOrderNumber != null) ? maxOrderNumber + 1 : 1;
            log.debug("Using new orderNumber: {} (based on max: {})", orderNumber, maxOrderNumber);
        }

        log.debug("Building new Group entity");
        // Tạo Group mới
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
        // Tạo các bản ghi GroupProduct cho từng sản phẩm
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
                    .orderNumber(i + 1) // Xác định thứ tự dựa vào vị trí trong danh sách
                    .build();

            log.debug("Saving GroupProduct entity to database");
            GroupProduct savedGroupProduct = groupProductRepository.save(groupProduct);
            log.debug("Saved GroupProduct with ID: {}", savedGroupProduct.getGroupProductId());
        }

        log.debug("Successfully created group with ID: {} and assigned {} products", groupId, productIds.size());
        return groupId;
    }

    @Transactional
    public void updateGroupAndProducts(Integer groupId, List<String> productIds, List<String> variants,List<String> productNames,
                                       Integer orderNumber, String image, String type,
                                       List<Integer> defaultOriginalPrices, List<Integer> defaultCurrentPrices) {
        log.debug("Updating group {} and its products. ProductIds: {}", groupId, productIds);

        // Validate inputs
        if (groupId == null) {
            throw new IllegalArgumentException("Group ID cannot be null");
        }

        // 1. Update the group entity
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group with ID " + groupId + " not found"));

        log.debug("Found existing group: {}", group);

        // Update group fields if provided
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

        // 2. Handle product assignments
        if (productIds != null) {
            // Remove existing product assignments
            log.debug("Deleting existing GroupProduct entries for group ID: {}", groupId);
            groupProductRepository.deleteAllByGroupId(groupId);

            // Create new product assignments
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
                            .orderNumber(i + 1) // Ordering based on position in the list
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


}