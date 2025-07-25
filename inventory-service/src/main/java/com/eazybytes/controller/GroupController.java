package com.eazybytes.controller;

import com.eazybytes.dto.GroupDto;
import com.eazybytes.dto.GroupProductDto;
import com.eazybytes.dto.GroupWithProductsDto;
import com.eazybytes.dto.InventoryDto;
import com.eazybytes.model.Group;
import com.eazybytes.model.GroupProduct;
import com.eazybytes.repository.GroupRepository;
import com.eazybytes.service.GroupService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/group-variants")
@Slf4j
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private EntityManager entityManager;

    @GetMapping("/search")
    public ResponseEntity<List<GroupDto>> searchProducts(
            @RequestParam("query") String query
    ) {
        List<GroupDto> results = groupService.searchProducts(query);
        return ResponseEntity.ok(results);
    }


    @GetMapping("/get")
    public ResponseEntity<List<GroupWithProductsDto>> getGroupsWithProducts(
            @RequestParam String groupIds) {

        try {
            // 1. Parse chuỗi "1,2,3" thành List<Integer>
            List<Integer> ids = Arrays.stream(groupIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());

            if (ids.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.emptyList());
            }

            // 2. Query database để lấy tất cả GroupProduct thuộc các groupIds
            TypedQuery<GroupProduct> query = entityManager.createQuery(
                    "SELECT gp FROM GroupProduct gp WHERE gp.groupId IN :groupIds",
                    GroupProduct.class
            );
            query.setParameter("groupIds", ids);
            List<GroupProduct> groupProducts = query.getResultList();

            // 3. Nhóm sản phẩm theo groupId
            Map<Integer, List<GroupProduct>> productsByGroupId = groupProducts.stream()
                    .collect(Collectors.groupingBy(GroupProduct::getGroupId));

            // 4. Tạo response cho từng group
            List<GroupWithProductsDto> response = ids.stream().map(groupId -> {
                // Lấy danh sách sản phẩm của group hiện tại
                List<GroupProduct> products = productsByGroupId.getOrDefault(groupId, Collections.emptyList());

                // Chuyển đổi sang DTO
                List<GroupProductDto> productDtos = products.stream()
                        .map(gp -> GroupProductDto.builder()
                                .productId(gp.getProductId())
                                .variant(gp.getVariant())
                                .orderNumber(gp.getOrderNumber())
                                .productName(gp.getProductName())
                                .defaultOriginalPrice(gp.getDefaultOriginalPrice())
                                .defaultCurrentPrice(gp.getDefaultCurrentPrice())
                                .defaultColor(gp.getDefaultColor())
                                .build())
                        .collect(Collectors.toList());
                Group group = groupRepository.getById(groupId);
                // Tạo GroupDto (chỉ chứa groupId nếu không có thông tin khác)
                GroupDto groupDto = GroupDto.builder()
                        .groupId(group.getGroupId())
                        .orderNumber(group.getOrderNumber())
                        .image(group.getImage())
                        .type(group.getType())
                        .build();

                return GroupWithProductsDto.builder()
                        .groupDto(groupDto)
                        .products(productDtos)
                        .build();
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/groups")
    public ResponseEntity<?> getAllProductsByGroup(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = true) String type,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String sortByPrice,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String searchQuery) { // Thêm tham số tìm kiếm

        try {
            List<String> tagList = (tags != null && !tags.isEmpty())
                    ? Arrays.asList(tags.split(","))
                    : Collections.emptyList();

            List<String> brandList = (brand != null && !brand.isEmpty())
                    ? Arrays.asList(brand.split(","))
                    : Collections.emptyList();

            // Lấy toàn bộ dữ liệu đã lọc để tính tổng số phần tử
            List<GroupWithProductsDto> allFilteredGroups = groupService.getAllProductsByGroup(
                    0, Integer.MAX_VALUE, type, tagList, brandList, sortByPrice, minPrice, maxPrice, searchQuery);

            // Sắp xếp dữ liệu - chỉ sắp xếp theo orderNumber khi không có sortByPrice
            // Khi có sortByPrice (cả "asc" và "desc"), service đã xử lý sắp xếp theo giá
            if (sortByPrice == null || sortByPrice.isEmpty()) {
                // Không có sortByPrice: sắp xếp theo orderNumber tăng dần (orderNumber nhỏ nhất ưu tiên hiển thị trước)
                allFilteredGroups.sort((g1, g2) -> {
                    Integer order1 = (g1.getGroupDto() != null) ? g1.getGroupDto().getOrderNumber() : null;
                    Integer order2 = (g2.getGroupDto() != null) ? g2.getGroupDto().getOrderNumber() : null;
                    // Xử lý trường hợp null - đặt null cuối cùng
                    if (order1 == null && order2 == null) return 0;
                    if (order1 == null) return 1;
                    if (order2 == null) return -1;
                    return order1.compareTo(order2);
                });
            }
            // Khi có sortByPrice ("asc" hoặc "desc"), giữ nguyên thứ tự đã được service sắp xếp theo giá

            // Tính toán phân trang
            int totalElements = allFilteredGroups.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            // Cắt dữ liệu theo trang hiện tại
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalElements);
            List<GroupWithProductsDto> pagedGroups = (startIndex < totalElements) 
                ? allFilteredGroups.subList(startIndex, endIndex)
                : Collections.emptyList();

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("content", pagedGroups);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

<<<<<<< HEAD
=======
    @GetMapping("/api/test-query")
    public ResponseEntity<String> testQuery(
            @RequestParam String query, 
            @RequestParam String deviceType) {
        
        try {
            groupService.testQuery(query, deviceType);
            return ResponseEntity.ok("Test completed. Check server logs for results.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Test failed: " + e.getMessage());
        }
    }

>>>>>>> server
    @PostMapping
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> createGroup(@RequestBody Map<String, Object> request) {
        log.debug("Received request to create group: {}", request);
        String groupName = (String) request.get("groupName");

        String brand = (String) request.get("brand");

        List<String> productIds = (List<String>) request.get("productIds");
        log.debug("Extracted productIds: {}", productIds);

        List<String> variants = (List<String>) request.get("variants");

        List<String> productNames = (List<String>) request.get("productNames");

        List<Integer> defaultOriginalPrices = (List<Integer>) request.get("defaultOriginalPrices");

        List<Integer> defaultCurrentPrices = (List<Integer>) request.get("defaultCurrentPrices");

        List<String> defaultColors = (List<String>) request.get("defaultColors");
        Integer orderNumber = request.get("orderNumber") != null ?
                Integer.parseInt(request.get("orderNumber").toString()) : null;
        log.debug("Extracted orderNumber: {}", orderNumber);

        String image = (String) request.get("image");
        log.debug("Extracted image: {}", image);

        String type = (String) request.get("type");
        log.debug("Extracted type: {}", type);

        log.debug("Calling groupService.createGroupAndAssignProducts");
        Integer groupId = groupService.createGroupAndAssignProducts(productIds, orderNumber, image, type,variants,productNames,defaultOriginalPrices,defaultCurrentPrices,defaultColors,groupName,brand);
        log.debug("Created group with ID: {}", groupId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("groupId", groupId));
    }

    @PutMapping("/{groupId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<?> updateGroup(@PathVariable Integer groupId, @RequestBody Map<String, Object> request) {
        log.debug("Received request to update group with ID {}: {}", groupId, request);

        try {
            // Check if group exists
            Optional<Group> existingGroup = groupRepository.findById(groupId);
            if (existingGroup.isEmpty()) {
                log.warn("Group with ID {} not found", groupId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Group not found"));
            }

            List<String> productIds = (List<String>) request.get("productIds");
            List<String> variants = (List<String>) request.get("variants");
            List<String> productNames = (List<String>) request.get("productNames");

            List<Integer> defaultOriginalPrices = (List<Integer>) request.get("defaultOriginalPrices");
            List<Integer> defaultCurrentPrices = (List<Integer>) request.get("defaultCurrentPrices");
            List<String> defaultColors = (List<String>) request.get("defaultColors");

            Integer orderNumber = request.get("orderNumber") != null ?
                    Integer.parseInt(request.get("orderNumber").toString()) : null;

            String image = (String) request.get("image");
            String type = (String) request.get("type");

            log.debug("Calling groupService.updateGroupAndProducts");
            groupService.updateGroupAndProducts(groupId, productIds, variants,productNames, orderNumber,
                    image, type, defaultOriginalPrices, defaultCurrentPrices, defaultColors);

            return ResponseEntity.ok(Map.of("message", "Group updated successfully"));
        } catch (Exception e) {
            log.error("Error updating group: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating group: " + e.getMessage()));
        }
    }

    @PutMapping("/{groupId}/priority")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    public ResponseEntity<Group> updateGroupPriority(
            @PathVariable Integer groupId,
            @RequestBody Map<String, Integer> request) {

        Integer orderNumber = request.get("orderNumber");

        if (orderNumber == null) {
            return ResponseEntity.badRequest().build();
        }

        Group updatedGroup = groupService.updateGroupPriority(groupId, orderNumber);
        return ResponseEntity.ok(updatedGroup);
    }

    @DeleteMapping("/group-product/product/{productId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroupProductByProductId(@PathVariable String productId) {
        try {
            groupService.deleteByProductId(productId);
            log.info("Successfully deleted group-product link for product ID: {}", productId);
        } catch (Exception e) {
            log.error("Error deleting group-product link for product ID {}: {}", productId, e.getMessage());
            throw new RuntimeException("Failed to delete group-product link for product: " + productId, e);
        }
    }

    @DeleteMapping("/group-product/group/{groupId}")
    @PreAuthorize("@roleChecker.hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroupProductsByGroupId(@PathVariable Integer groupId) {
        try {
            groupService.deleteByGroupId(groupId);
            log.info("Successfully deleted all group-product links for group ID: {}", groupId);
        } catch (Exception e) {
            log.error("Error deleting group-product links for group ID {}: {}", groupId, e.getMessage());
            throw new RuntimeException("Failed to delete group-product links for group: " + groupId, e);
        }
    }


}