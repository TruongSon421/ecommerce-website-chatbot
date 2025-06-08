package com.eazybytes.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewActionRequest {
    
    @NotNull(message = "Action không được để trống")
    private ReviewAction action;
    
    private String adminNote;
    
    public enum ReviewAction {
        APPROVE,
        REJECT,
        HIDE,
        SHOW,
        DELETE
    }
} 