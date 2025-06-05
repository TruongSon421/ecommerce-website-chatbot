package com.eazybytes.controller;

import com.eazybytes.dto.review.*;
import com.eazybytes.service.ProductReviewService;
import com.eazybytes.security.RoleChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ProductReviewController {
    
    private final ProductReviewService reviewService;
    private final RoleChecker roleChecker;
    
    // ===== USER ENDPOINTS (FR-14) =====
    
    /**
     * Tạo đánh giá mới
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(@RequestBody @Valid CreateReviewRequest request) {
        String userId = roleChecker.getCurrentUserId();
        String username = roleChecker.getCurrentUsername();
        
        return reviewService.createReview(request, userId, username);
    }
    
    /**
     * Cập nhật đánh giá
     */
    @PutMapping("/{reviewId}")
    public ReviewResponse updateReview(@PathVariable String reviewId,
                                     @RequestBody @Valid UpdateReviewRequest request) {
        String userId = roleChecker.getCurrentUserId();
        return reviewService.updateReview(reviewId, request, userId);
    }
    
    /**
     * Xóa đánh giá (user)
     */
    @DeleteMapping("/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable String reviewId) {
        String userId = roleChecker.getCurrentUserId();
        reviewService.deleteReview(reviewId, userId);
    }
    
    /**
     * Lấy đánh giá của sản phẩm (public)
     */
    @GetMapping("/product/{productId}")
    public Page<ReviewResponse> getProductReviews(@PathVariable String productId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size,
                                                @RequestParam(required = false) String color) {
        Pageable pageable = PageRequest.of(page, size);
        if (color != null) {
            return reviewService.getProductReviewsByColor(productId, color, pageable);
        }
        return reviewService.getProductReviews(productId, pageable);
    }
    
    /**
     * Lấy thống kê đánh giá của sản phẩm (public)
     */
    @GetMapping("/product/{productId}/stats")
    public Map<String, Object> getProductReviewStats(@PathVariable String productId,
                                                    @RequestParam(required = false) String color) {
        if (color != null) {
            return reviewService.getProductReviewStatsByColor(productId, color);
        }
        return reviewService.getProductReviewStats(productId);
    }
    
    /**
     * Lấy đánh giá và thống kê tổng hợp của sản phẩm (public) - Tiện cho khách vãng lai
     */
    @GetMapping("/product/{productId}/overview")
    public Map<String, Object> getProductReviewOverview(@PathVariable String productId,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "5") int size,
                                                       @RequestParam(required = false) String color) {
        Pageable pageable = PageRequest.of(page, size);
        
        // Lấy đánh giá với phân trang
        Page<ReviewResponse> reviews;
        Map<String, Object> stats;
        
        if (color != null) {
            reviews = reviewService.getProductReviewsByColor(productId, color, pageable);
            stats = reviewService.getProductReviewStatsByColor(productId, color);
        } else {
            reviews = reviewService.getProductReviews(productId, pageable);
            stats = reviewService.getProductReviewStats(productId);
        }
        
        return Map.of(
            "reviews", reviews,
            "stats", stats,
            "productId", productId,
            "color", color != null ? color : "all"
        );
    }
    
    /**
     * Lấy đánh giá của user hiện tại
     */
    @GetMapping("/my-reviews")
    public List<ReviewResponse> getUserReviews() {
        String userId = roleChecker.getCurrentUserId();
        return reviewService.getUserReviews(userId);
    }
    
    // ===== ADMIN ENDPOINTS (FR-15) =====
    
    /**
     * Lấy tất cả đánh giá chưa duyệt (Admin)
     */
    @GetMapping("/admin/pending")
    public Page<ReviewResponse> getPendingReviews(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewService.getPendingReviews(pageable);
    }
    
    /**
     * Lấy tất cả đánh giá của sản phẩm (bao gồm chưa duyệt) - Admin
     */
    @GetMapping("/admin/product/{productId}")
    public Page<ReviewResponse> getAllProductReviews(@PathVariable String productId,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewService.getAllProductReviews(productId, pageable);
    }
    
    /**
     * Thực hiện action với đánh giá (Admin)
     */
    @PostMapping("/admin/{reviewId}/action")
    public ResponseEntity<?> performAdminAction(@PathVariable String reviewId,
                                              @RequestBody @Valid AdminReviewActionRequest request) {
        try {
            ReviewResponse response = reviewService.performAdminAction(reviewId, request);
            
            if (request.getAction() == AdminReviewActionRequest.ReviewAction.DELETE) {
                return ResponseEntity.noContent().build();
            }
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error performing admin action on review {}: {}", reviewId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
    
    /**
     * Duyệt đánh giá (Admin) - Shortcut endpoint
     */
    @PostMapping("/admin/{reviewId}/approve")
    public ReviewResponse approveReview(@PathVariable String reviewId) {
        return reviewService.approveReview(reviewId);
    }
    
    /**
     * Từ chối đánh giá (Admin) - Shortcut endpoint
     */
    @PostMapping("/admin/{reviewId}/reject")
    public ReviewResponse rejectReview(@PathVariable String reviewId,
                                     @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return reviewService.rejectReview(reviewId, reason);
    }
    
    /**
     * Xóa đánh giá (Admin)
     */
    @DeleteMapping("/admin/{reviewId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void adminDeleteReview(@PathVariable String reviewId) {
        reviewService.adminDeleteReview(reviewId);
    }
    
    /**
     * Ẩn/hiện đánh giá (Admin)
     */
    @PostMapping("/admin/{reviewId}/toggle-visibility")
    public ReviewResponse toggleReviewVisibility(@PathVariable String reviewId,
                                               @RequestBody Map<String, Boolean> body) {
        Boolean visible = body.get("visible");
        if (visible == null) {
            visible = true; // Default to show
        }
        return reviewService.toggleReviewVisibility(reviewId, visible);
    }
} 