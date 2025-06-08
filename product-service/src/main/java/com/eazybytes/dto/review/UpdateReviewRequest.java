package com.eazybytes.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewRequest {
    
    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating phải từ 1-5 sao")
    @Max(value = 5, message = "Rating phải từ 1-5 sao")
    private Integer rating;
    
    @Size(max = 200, message = "Title không được vượt quá 200 ký tự")
    private String title;
    
    @Size(max = 2000, message = "Content không được vượt quá 2000 ký tự")
    private String content;
} 