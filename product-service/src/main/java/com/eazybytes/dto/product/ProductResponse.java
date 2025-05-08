package com.eazybytes.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {
    private String productId;
    private String productName;
    private String description;

    private String brand;
    private Map<String,List<Map<String,String>>> images;
    private String type;
    private String warrantyPeriod; // thời gian bảo hành
    private List<Map<String,String>> productReviews; // bài đánh giá sản phẩm
    private List<String> promotions; // chương trình khuyến mãi
    private String release; // thời điểm ra mắt

    // Các trường chung cho inventory
    private List<String> colors = new ArrayList<>();
    private List<Integer> original_prices = new ArrayList<>();
    private List<Integer> current_prices = new ArrayList<>();
    private List<Integer> quantities = new ArrayList<>();
    private List<String> productNames = new ArrayList<>();

    private List<Specification> specifications = new ArrayList<>();

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class Specification {
        private String name;
        private Object value;
    }
}