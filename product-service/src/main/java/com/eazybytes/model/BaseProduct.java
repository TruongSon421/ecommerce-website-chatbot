package com.eazybytes.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id; // MongoDB annotation
import org.springframework.data.mongodb.core.mapping.Document; // MongoDB annotation

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document
public abstract class BaseProduct {
    @Id
    private String productId;

    private String productName;
    private String description;
    private String brand;

    private Map<String,List<Map<String,String>>> images;

    private String warrantyPeriod;

    private List<Map<String,String>> productReviews; // bài đánh giá sản phẩm

    private List<String> promotions; // chương trình khuyến mãi

    private String release;
    private String type;

}