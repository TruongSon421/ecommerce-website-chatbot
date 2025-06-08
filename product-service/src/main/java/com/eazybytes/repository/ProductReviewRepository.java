package com.eazybytes.repository;

import com.eazybytes.model.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    
    // Tìm đánh giá theo productId, chỉ hiển thị đã approve và visible
    List<ProductReview> findByProductIdAndIsApprovedTrueAndIsVisibleTrueOrderByCreatedAtDesc(String productId);
    
    // Tìm đánh giá theo productId với phân trang
    Page<ProductReview> findByProductIdAndIsApprovedTrueAndIsVisibleTrue(String productId, Pageable pageable);
    
    // Tìm đánh giá theo productId và color với phân trang
    Page<ProductReview> findByProductIdAndColorAndIsApprovedTrueAndIsVisibleTrue(String productId, String color, Pageable pageable);
    
    // Tìm đánh giá theo userId
    List<ProductReview> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Tìm đánh giá theo userId, productId và color
    Optional<ProductReview> findByUserIdAndProductIdAndColor(String userId, String productId, String color);
    
    // Kiểm tra user đã review sản phẩm với màu này chưa
    boolean existsByUserIdAndProductIdAndColor(String userId, String productId, String color);
    
    // Tìm tất cả đánh giá của user cho một sản phẩm (tất cả màu)
    List<ProductReview> findByUserIdAndProductIdOrderByCreatedAtDesc(String userId, String productId);
    
    // Admin: Tìm tất cả đánh giá chưa được duyệt
    Page<ProductReview> findByIsApprovedFalseOrderByCreatedAtDesc(Pageable pageable);
    
    // Admin: Tìm tất cả đánh giá theo trạng thái
    Page<ProductReview> findByIsApprovedAndIsVisibleOrderByCreatedAtDesc(Boolean isApproved, Boolean isVisible, Pageable pageable);
    
    // Admin: Tìm đánh giá theo productId (bao gồm chưa approve)
    Page<ProductReview> findByProductIdOrderByCreatedAtDesc(String productId, Pageable pageable);
    
    // Tính điểm trung bình của sản phẩm
    @Query("{'productId': ?0, 'isApproved': true, 'isVisible': true}")
    List<ProductReview> findApprovedReviewsByProductId(String productId);
    
    // Tính điểm trung bình của sản phẩm theo màu
    @Query("{'productId': ?0, 'color': ?1, 'isApproved': true, 'isVisible': true}")
    List<ProductReview> findApprovedReviewsByProductIdAndColor(String productId, String color);
    
    // Đếm số đánh giá theo rating cho một sản phẩm
    long countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(String productId, Integer rating);
    
    // Đếm số đánh giá theo rating cho một sản phẩm và màu
    long countByProductIdAndColorAndRatingAndIsApprovedTrueAndIsVisibleTrue(String productId, String color, Integer rating);
    
    // Đếm tổng số đánh giá của sản phẩm (đã approve và visible)
    long countByProductIdAndIsApprovedTrueAndIsVisibleTrue(String productId);
    
    // Đếm tổng số đánh giá của sản phẩm theo màu (đã approve và visible)
    long countByProductIdAndColorAndIsApprovedTrueAndIsVisibleTrue(String productId, String color);
} 