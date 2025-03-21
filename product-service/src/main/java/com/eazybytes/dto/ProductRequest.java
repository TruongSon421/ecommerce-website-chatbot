package com.eazybytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequest {
    private String productName;
    private String description;

    private String brand;
    private Map<String,List<Map<String,String>>> images;
    private String type;  // "PHONE" or "LAPTOP"
    private String warrantyPeriod; // thời gian bảo hành
    private List<Map<String,String>> productReviews; // bài đánh giá sản phẩm [{'title':'...','content':'...'}]
    private List<String> promotions; // chương trình khuyến mãi
    private String release; // thời điểm ra mắt
}