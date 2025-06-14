package com.eazybytes.service;

import com.eazybytes.client.OrderClient;
import com.eazybytes.dto.review.*;
import com.eazybytes.model.ProductReview;
import com.eazybytes.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductReviewService {
    
    private final ProductReviewRepository reviewRepository;
    private final OrderClient orderClient;
    
    /**
     * Tạo đánh giá mới (FR-14)
     */
    public ReviewResponse createReview(CreateReviewRequest request, String userId, String username) {
        // Kiểm tra user đã mua sản phẩm này chưa
        boolean hasPurchased = orderClient.checkIfUserPurchasedProduct(userId, request.getProductId());
        if (!hasPurchased) {
            throw new IllegalArgumentException("Bạn cần mua sản phẩm này trước khi có thể đánh giá");
        }
        
        // Kiểm tra user đã đánh giá sản phẩm này chưa
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new IllegalArgumentException("Bạn đã đánh giá sản phẩm này rồi");
        }
        
        ProductReview review = ProductReview.builder()
                .productId(request.getProductId())
                .userId(userId)
                .username(username)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .isApproved(false) // Cần admin duyệt
                .isVisible(true)
                .build();
        
        ProductReview savedReview = reviewRepository.save(review);
        log.info("Created new review for product {} by user {}", request.getProductId(), userId);
        
        return mapToResponse(savedReview);
    }
    
    /**
     * Cập nhật đánh giá (chỉ user sở hữu)
     */
    public ReviewResponse updateReview(String reviewId, UpdateReviewRequest request, String userId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        
        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa đánh giá này");
        }
        
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setContent(request.getContent());
        review.setUpdatedAt(LocalDateTime.now());
        review.setIsApproved(false); // Reset approval khi update
        
        ProductReview savedReview = reviewRepository.save(review);
        log.info("Updated review {} by user {}", reviewId, userId);
        
        return mapToResponse(savedReview);
    }
    
    /**
     * Xóa đánh giá (chỉ user sở hữu)
     */
    public void deleteReview(String reviewId, String userId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        
        if (!review.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xóa đánh giá này");
        }
        
        reviewRepository.delete(review);
        log.info("Deleted review {} by user {}", reviewId, userId);
    }
    
    /**
     * Lấy đánh giá của sản phẩm (chỉ đã approve và visible)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(String productId, Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByProductIdAndIsApprovedTrueAndIsVisibleTrue(productId, pageable);
        return reviews.map(this::mapToResponse);
    }
    
    /**
     * Lấy đánh giá của user
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(String userId) {
        List<ProductReview> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return reviews.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    /**
     * Lấy đánh giá của user cho sản phẩm cụ thể
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviewsForProduct(String userId, String productId) {
        List<ProductReview> reviews = reviewRepository.findByUserIdAndProductIdOrderByCreatedAtDesc(userId, productId);
        return reviews.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    /**
     * Tính thống kê đánh giá của sản phẩm
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getProductReviewStats(String productId) {
        List<ProductReview> reviews = reviewRepository.findApprovedReviewsByProductId(productId);
        
        if (reviews.isEmpty()) {
            return Map.of(
                "averageRating", 0.0,
                "totalReviews", 0,
                "ratingDistribution", Map.of(
                    "5", 0, "4", 0, "3", 0, "2", 0, "1", 0
                )
            );
        }
        
        double averageRating = reviews.stream()
                .mapToInt(ProductReview::getRating)
                .average()
                .orElse(0.0);
        
        Map<String, Long> ratingDistribution = Map.of(
            "5", reviewRepository.countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(productId, 5),
            "4", reviewRepository.countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(productId, 4),
            "3", reviewRepository.countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(productId, 3),
            "2", reviewRepository.countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(productId, 2),
            "1", reviewRepository.countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(productId, 1)
        );
        
        return Map.of(
            "averageRating", Math.round(averageRating * 10.0) / 10.0, // Round to 1 decimal
            "totalReviews", reviews.size(),
            "ratingDistribution", ratingDistribution
        );
    }
    
    // ===== ADMIN FUNCTIONS (FR-15) =====
    
    /**
     * Lấy tất cả đánh giá chưa duyệt (Admin)
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPendingReviews(Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByIsApprovedFalseOrderByCreatedAtDesc(pageable);
        return reviews.map(this::mapToResponse);
    }
    
    /**
     * Lấy tất cả đánh giá của sản phẩm (bao gồm chưa duyệt) - Admin
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllProductReviews(String productId, Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return reviews.map(this::mapToResponse);
    }
    
    /**
     * Duyệt đánh giá (Admin)
     */
    public ReviewResponse approveReview(String reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        
        review.approve();
        ProductReview savedReview = reviewRepository.save(review);
        log.info("Admin approved review {}", reviewId);
        
        return mapToResponse(savedReview);
    }
    
    /**
     * Từ chối đánh giá (Admin)
     */
    public ReviewResponse rejectReview(String reviewId, String reason) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        
        review.reject(reason);
        ProductReview savedReview = reviewRepository.save(review);
        log.info("Admin rejected review {} with reason: {}", reviewId, reason);
        
        return mapToResponse(savedReview);
    }
    
    /**
     * Ẩn/hiện đánh giá (Admin)
     */
    public ReviewResponse toggleReviewVisibility(String reviewId, boolean visible) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        
        if (visible) {
            review.show();
        } else {
            review.hide();
        }
        
        ProductReview savedReview = reviewRepository.save(review);
        log.info("Admin {} review {}", visible ? "showed" : "hid", reviewId);
        
        return mapToResponse(savedReview);
    }
    
    /**
     * Xóa đánh giá (Admin)
     */
    public void adminDeleteReview(String reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đánh giá"));
        
        reviewRepository.delete(review);
        log.info("Admin deleted review {}", reviewId);
    }
    
    /**
     * Thực hiện action từ admin
     */
    public ReviewResponse performAdminAction(String reviewId, AdminReviewActionRequest request) {
        switch (request.getAction()) {
            case APPROVE:
                return approveReview(reviewId);
            case REJECT:
                return rejectReview(reviewId, request.getAdminNote());
            case HIDE:
                return toggleReviewVisibility(reviewId, false);
            case SHOW:
                return toggleReviewVisibility(reviewId, true);
            case DELETE:
                adminDeleteReview(reviewId);
                return null;
            default:
                throw new IllegalArgumentException("Invalid action: " + request.getAction());
        }
    }
    
    private ReviewResponse mapToResponse(ProductReview review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .username(review.getUsername())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isApproved(review.getIsApproved())
                .isVisible(review.getIsVisible())
                .adminNote(review.getAdminNote())
                .build();
    }
} 