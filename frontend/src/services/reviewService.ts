import api from '../config/axios';
import {
  CreateReviewRequest,
  UpdateReviewRequest,
  ReviewResponse,
  PaginatedReviews,
  ReviewStats,
  ProductReviewOverview,
  AdminReviewActionRequest,
  BackendReviewResponse,
  transformBackendReview
} from '../types/review';

const BASE_URL = '/reviews';

// ===== USER ENDPOINTS =====

/**
 * Tạo đánh giá mới
 */
export const createReview = async (request: CreateReviewRequest): Promise<ReviewResponse> => {
  const response = await api.post(BASE_URL, request);
  return response.data;
};

/**
 * Cập nhật đánh giá
 */
export const updateReview = async (reviewId: string, request: UpdateReviewRequest): Promise<ReviewResponse> => {
  const response = await api.put(`${BASE_URL}/${reviewId}`, request);
  return response.data;
};

/**
 * Xóa đánh giá (user)
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${reviewId}`);
};

/**
 * Lấy đánh giá của sản phẩm (public)
 */
export const getProductReviews = async (
  productId: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc'
): Promise<PaginatedReviews> => {
  const response = await api.get(`${BASE_URL}/product/${productId}`, {
    params: { page, size, sortBy, sortDir }
  });
  
  // Transform backend response to frontend format
  const transformedContent = response.data.content.map((review: BackendReviewResponse) => 
    transformBackendReview(review)
  );
  
  return {
    ...response.data,
    content: transformedContent
  };
};

/**
 * Lấy thống kê đánh giá của sản phẩm (public)
 */
export const getProductReviewStats = async (productId: string): Promise<ReviewStats> => {
  const response = await api.get(`${BASE_URL}/product/${productId}/stats`);
  return response.data;
};

/**
 * Lấy đánh giá và thống kê tổng hợp của sản phẩm (public)
 */
export const getProductReviewOverview = async (
  productId: string,
  page: number = 0,
  size: number = 5
): Promise<ProductReviewOverview> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  const response = await api.get(`${BASE_URL}/product/${productId}/overview?${params}`);
  
  // Transform backend response to frontend format
  const transformedContent = response.data.reviews.content.map((review: BackendReviewResponse) => 
    transformBackendReview(review)
  );
  
  return {
    ...response.data,
    reviews: {
      ...response.data.reviews,
      content: transformedContent
    }
  };
};

/**
 * Lấy đánh giá của user hiện tại
 */
export const getUserReviews = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewResponse[]> => {
  const response = await api.get('/reviews/my-reviews', {
    params: { page, size }
  });
  
  // Transform backend response to frontend format if needed
  if (Array.isArray(response.data)) {
    // If direct array response
    return response.data.map((review: BackendReviewResponse) => 
      transformBackendReview(review)
    );
  } else if (response.data.content) {
    // If paginated response
    const transformedContent = response.data.content.map((review: BackendReviewResponse) => 
      transformBackendReview(review)
    );
    return transformedContent;
  }
  
  return response.data;
};

// ===== ADMIN ENDPOINTS =====

/**
 * Lấy tất cả đánh giá chưa duyệt (Admin)
 */
export const getPendingReviews = async (page: number = 0, size: number = 20): Promise<PaginatedReviews> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  const response = await api.get(`${BASE_URL}/admin/pending?${params}`);
  
  // Transform backend response to frontend format
  const transformedContent = response.data.content.map((review: BackendReviewResponse) => 
    transformBackendReview(review)
  );
  
  return {
    ...response.data,
    content: transformedContent
  };
};

/**
 * Lấy tất cả đánh giá của sản phẩm (bao gồm chưa duyệt) - Admin
 */
export const getAllProductReviews = async (
  productId: string,
  page: number = 0,
  size: number = 20
): Promise<PaginatedReviews> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  const response = await api.get(`${BASE_URL}/admin/product/${productId}?${params}`);
  
  // Transform backend response to frontend format
  const transformedContent = response.data.content.map((review: BackendReviewResponse) => 
    transformBackendReview(review)
  );
  
  return {
    ...response.data,
    content: transformedContent
  };
};

/**
 * Thực hiện action với đánh giá (Admin)
 */
export const performAdminAction = async (
  reviewId: string,
  request: AdminReviewActionRequest
): Promise<ReviewResponse | void> => {
  const response = await api.post(`${BASE_URL}/admin/${reviewId}/action`, request);
  return response.data;
};

/**
 * Duyệt đánh giá (Admin)
 */
export const approveReview = async (reviewId: string): Promise<ReviewResponse> => {
  const response = await api.post(`${BASE_URL}/admin/${reviewId}/approve`);
  return response.data;
};

/**
 * Từ chối đánh giá (Admin)
 */
export const rejectReview = async (reviewId: string, reason: string): Promise<ReviewResponse> => {
  const response = await api.post(`${BASE_URL}/admin/${reviewId}/reject`, { reason });
  return response.data;
};

/**
 * Xóa đánh giá (Admin)
 */
export const adminDeleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`${BASE_URL}/admin/${reviewId}`);
};

/**
 * Ẩn/hiện đánh giá (Admin)
 */
export const toggleReviewVisibility = async (reviewId: string, visible: boolean): Promise<ReviewResponse> => {
  const response = await api.post(`${BASE_URL}/admin/${reviewId}/toggle-visibility`, { visible });
  return response.data;
};

/**
 * Lấy đánh giá của user cho sản phẩm cụ thể trong đơn hàng
 */
export const getUserReview = async (orderId: string, productId: string): Promise<ReviewResponse | null> => {
  try {
    const response = await api.get(`${BASE_URL}/my-reviews/product/${productId}`);
    if (response.data && response.data.length > 0) {
      return transformBackendReview(response.data[0]);
    }
    return null;
  } catch (error) {
    return null;
  }
}; 