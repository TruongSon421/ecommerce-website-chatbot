package com.eazybytes.model;

import org.springframework.data.annotation.Id; // MongoDB annotation
import org.springframework.data.mongodb.core.mapping.Document; // MongoDB annotation

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.validation.constraints.Pattern;
import javax.validation.Valid;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document
public abstract class BaseProduct {
    @Id
    private String productId;

    @NotBlank(message = "Product name không được để trống")
    @Size(min = 1, max = 200, message = "Product name phải từ 1-200 ký tự")
    private String productName;

    @Size(max = 1000, message = "Description tối đa 1000 ký tự")
    private String description;

    @NotBlank(message = "Brand không được để trống")
    @Size(min = 1, max = 100, message = "Brand phải từ 1-100 ký tự")
    private String brand;

    private Map<String,List<Map<String,String>>> images;

    @Pattern(regexp = "^[0-9]+ (tháng|năm)$", 
             message = "Warranty period phải theo format: '12 tháng' hoặc '2 năm'")
    private String warrantyPeriod;

    @Valid
    private List<@Valid ProductReview> productReviews;

    private List<@NotBlank String> promotions;

    private String release;

}