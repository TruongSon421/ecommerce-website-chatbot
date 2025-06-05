package com.eazybytes.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "product_reviews")
public class ProductReview {
    
    @Id
    private String reviewId;
    
    @NotBlank(message = "Product ID không được để trống")
    private String productId;
    
    @NotBlank(message = "User ID không được để trống")
    private String userId;
    
    private String color; // Color có thể null (sẽ được normalize thành "default")
    
    @NotBlank(message = "Username không được để trống")
    private String username;
    
    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating phải từ 1-5 sao")
    @Max(value = 5, message = "Rating phải từ 1-5 sao")
    private Integer rating;
    
    @Size(max = 200, message = "Title không được vượt quá 200 ký tự")
    private String title;
    
    @Size(max = 2000, message = "Content không được vượt quá 2000 ký tự")
    private String content;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    @Builder.Default
    private Boolean isApproved = false; // Admin approval required
    
    @Builder.Default
    private Boolean isVisible = true; // Can be hidden by admin
    
    private String adminNote; // Note from admin when approving/rejecting
    
    // Helper methods
    public void approve() {
        this.isApproved = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void reject(String reason) {
        this.isApproved = false;
        this.isVisible = false;
        this.adminNote = reason;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void hide() {
        this.isVisible = false;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void show() {
        this.isVisible = true;
        this.updatedAt = LocalDateTime.now();
    }
    
    // Helper method để normalize color
    public String getNormalizedColor() {
        return (color == null || color.trim().isEmpty()) ? "default" : color;
    }
    
    // Pre-persist để normalize color
    public void normalizeColor() {
        this.color = getNormalizedColor();
    }
} 