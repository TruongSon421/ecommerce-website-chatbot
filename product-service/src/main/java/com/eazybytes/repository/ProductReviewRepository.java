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
    
    // Tìm đánh giá theo userId
    List<ProductReview> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Tìm đánh giá theo userId và productId
    Optional<ProductReview> findByUserIdAndProductId(String userId, String productId);
    
    // Kiểm tra user đã review sản phẩm này chưa
    boolean existsByUserIdAndProductId(String userId, String productId);
    
    // Tìm tất cả đánh giá của user cho một sản phẩm
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
    
    // Đếm số đánh giá theo rating cho một sản phẩm
    long countByProductIdAndRatingAndIsApprovedTrueAndIsVisibleTrue(String productId, Integer rating);
    
    // Đếm tổng số đánh giá của sản phẩm (đã approve và visible)
    long countByProductIdAndIsApprovedTrueAndIsVisibleTrue(String productId);
} 