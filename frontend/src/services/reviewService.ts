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
  return response.data;
};

/**
 * Lấy thống kê đánh giá của sản phẩm (public)
 */
export const getProductReviewStats = async (productId: string, color?: string): Promise<ReviewStats> => {
  const params = color ? `?color=${color}` : '';
  const response = await api.get(`${BASE_URL}/product/${productId}/stats${params}`);
  return response.data;
};

/**
 * Lấy đánh giá và thống kê tổng hợp của sản phẩm (public)
 */
export const getProductReviewOverview = async (
  productId: string,
  page: number = 0,
  size: number = 5,
  color?: string
): Promise<ProductReviewOverview> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (color) {
    params.append('color', color);
  }
  
  const response = await api.get(`${BASE_URL}/product/${productId}/overview?${params}`);
  return response.data;
};

/**
 * Lấy đánh giá của user hiện tại
 */
export const getUserReviews = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedReviews> => {
  const response = await api.get('/reviews/user', {
    params: { page, size }
  });
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

// Get user's review for a specific product in an order (mock implementation)
export const getUserReview = async (orderId: string, productId: string): Promise<ReviewResponse | null> => {
  try {
    // This would be implemented based on actual API structure
    const response = await api.get(`/reviews/user-review`, {
      params: { orderId, productId }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No review found
    }
    throw error;
  }
}; 