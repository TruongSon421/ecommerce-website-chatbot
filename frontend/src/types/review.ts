export interface Review {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  color: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

// Backend API response structure for user reviews
export interface BackendReviewResponse {
  reviewId: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  isVisible: boolean;
  adminNote?: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  content: string;
  title?: string;
}

export interface UpdateReviewRequest {
  rating: number;
  content: string;
  title?: string;
}

// Frontend normalized interface for user reviews
export interface ReviewResponse {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  // Keep backend fields for direct access
  isApproved: boolean;
  isVisible: boolean;
  adminNote?: string;
  title?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // rating -> count
  };
}

export interface ProductReviewOverview {
  reviews: {
    content: ReviewResponse[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  stats: ReviewStats;
  productId: string;
}

export interface AdminReviewActionRequest {
  action: 'APPROVE' | 'REJECT' | 'DELETE';
  reason?: string;
}

export interface PaginatedReviews {
  content: ReviewResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Transform function to convert backend response to frontend format for user reviews
export const transformBackendReview = (backendReview: BackendReviewResponse): ReviewResponse => {
  // Determine status based on isApproved and adminNote
  let status: 'PENDING' | 'APPROVED' | 'REJECTED';
  if (backendReview.isApproved) {
    status = 'APPROVED';
  } else if (backendReview.adminNote) {
    status = 'REJECTED';
  } else {
    status = 'PENDING';
  }

  return {
    id: backendReview.reviewId,
    productId: backendReview.productId,
    userId: backendReview.userId,
    username: backendReview.username,
    rating: backendReview.rating,
    comment: backendReview.content,
    status: status,
    visible: backendReview.isVisible,
    createdAt: backendReview.createdAt,
    updatedAt: backendReview.updatedAt,
    rejectionReason: backendReview.adminNote,
    // Keep backend fields
    isApproved: backendReview.isApproved,
    isVisible: backendReview.isVisible,
    adminNote: backendReview.adminNote,
    title: backendReview.title,
  };
}; 