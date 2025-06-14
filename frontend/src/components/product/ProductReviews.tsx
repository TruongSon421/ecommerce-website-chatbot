import React, { useState, useEffect } from 'react';
import { 
  getProductReviewOverview, 
  createReview, 
  updateReview, 
  deleteReview,
  getUserReviews 
} from '../../services/reviewService';
import { checkIfUserPurchasedProduct } from '../../services/orderService';
import { 
  ProductReviewOverview, 
  ReviewResponse, 
  CreateReviewRequest, 
  UpdateReviewRequest 
} from '../../types/review';
import { useAuth } from '../hooks/useAuth';

interface ProductReviewsProps {
  productId: string;
  selectedColor?: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const [overview, setOverview] = useState<ProductReviewOverview | null>(null);
  const [userReviews, setUserReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviewData();
    if (isAuthenticated) {
      loadUserReviews();
      checkPurchaseStatus();
    }
  }, [productId, currentPage, isAuthenticated]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      const data = await getProductReviewOverview(
        productId, 
        currentPage, 
        10
      );
      console.log('Review data received:', data);
      console.log('Reviews:', data.reviews?.content);
      setOverview(data);
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async () => {
    try {
      const reviews = await getUserReviews();
      const productReviews = reviews.filter(r => r.productId === productId);
      setUserReviews(productReviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const purchased = await checkIfUserPurchasedProduct(
        user.id, 
        productId
      );
      setHasPurchased(purchased);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      if (editingReview) {
        const request: UpdateReviewRequest = { rating, content: comment };
        await updateReview(editingReview.id, request);
      } else {
        const request: CreateReviewRequest = {
          productId,
          rating,
          content: comment
        };
        await createReview(request);
      }
      
      // Reset form
      setRating(5);
      setComment('');
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Reload data
      await loadReviewData();
      await loadUserReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: ReviewResponse) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
      await deleteReview(reviewId);
      await loadReviewData();
      await loadUserReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'text-xl' : 'text-sm';
    return (
      <div className={`flex ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingStats = () => {
    if (!overview?.stats) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <div className="text-3xl font-bold mr-4">
            {overview.stats.averageRating.toFixed(1)}
          </div>
          {renderStars(Math.round(overview.stats.averageRating), 'lg')}
          <div className="ml-4 text-gray-600">
            ({overview.stats.totalReviews} đánh giá)
          </div>
        </div>
        
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center">
              <span className="w-8 text-sm">{star}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded mx-2">
                <div
                  className="h-2 bg-yellow-400 rounded"
                  style={{
                    width: `${((overview.stats.ratingDistribution[star] || 0) / overview.stats.totalReviews) * 100}%`
                  }}
                />
              </div>
              <span className="w-8 text-sm text-gray-600">
                {overview.stats.ratingDistribution[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUserReviewSection = () => {
    if (!isAuthenticated) {
      return (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">
            Vui lòng <a href="/login" className="underline">đăng nhập</a> để viết đánh giá
          </p>
        </div>
      );
    }

    if (!hasPurchased) {
      return (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-yellow-800">
            Bạn cần mua sản phẩm này để có thể đánh giá
          </p>
        </div>
      );
    }

    const existingReview = userReviews.find(r => r.productId === productId);

    return (
      <div className="mb-6">
        {existingReview ? (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">Đánh giá của bạn</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditReview(existingReview)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteReview(existingReview.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
            {renderStars(existingReview.rating)}
            <p className="mt-2 text-gray-700">{existingReview.comment}</p>
            <p className="text-sm text-gray-500 mt-2">
              Trạng thái: {existingReview.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Viết đánh giá
          </button>
        )}
      </div>
    );
  };

  const renderReviewForm = () => {
    if (!showReviewForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">
            {editingReview ? 'Sửa đánh giá' : 'Viết đánh giá'}
          </h3>
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Đánh giá *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Nhận xét *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded-lg"
                rows={4}
                required
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setComment('');
                }}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderReviewList = () => {
    if (!overview?.reviews.content.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          Chưa có đánh giá nào cho sản phẩm này
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {overview.reviews.content.map((review) => (
          <div key={review.id} className="border-b pb-4 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium">{review.username}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-gray-700 mb-2">{review.comment}</p>

          </div>
        ))}
        
        {overview.reviews.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1">
                {currentPage + 1} / {overview.reviews.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(overview.reviews.totalPages - 1, prev + 1))}
                disabled={currentPage >= overview.reviews.totalPages - 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6">Đánh giá sản phẩm</h3>
      
      {renderRatingStats()}
      {renderUserReviewSection()}
      {renderReviewList()}
      {renderReviewForm()}
    </div>
  );
};

export default ProductReviews; 