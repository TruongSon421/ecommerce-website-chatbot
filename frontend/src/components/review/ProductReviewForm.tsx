import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { createReview, getUserReview, updateReview } from '../../services/reviewService';
import { CreateReviewRequest, UpdateReviewRequest, ReviewResponse } from '../../types/review';
import { OrderItem } from '../../types/order';

interface ProductReviewFormProps {
  orderId: string;
  product: OrderItem;
  existingReview?: ReviewResponse | null;
  onClose: () => void;
  onReviewSubmitted: (review: ReviewResponse) => void;
  canReview: boolean;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
  orderId,
  product,
  existingReview,
  onClose,
  onReviewSubmitted,
  canReview
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canReview && !isEditing) {
      setError('Bạn không thể đánh giá sản phẩm này');
      return;
    }

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Bình luận phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let review: ReviewResponse;
      
      if (isEditing) {
        const updateRequest: UpdateReviewRequest = {
          rating,
          comment: comment.trim()
        };
        review = await updateReview(existingReview.id!, updateRequest);
              } else {
          const reviewRequest: CreateReviewRequest = {
            productId: product.productId,
            rating,
            comment: comment.trim(),
            color: product.color
          };
          review = await createReview(reviewRequest);
        }

      onReviewSubmitted(review);
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'gửi'} đánh giá`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl focus:outline-none transition-colors"
            disabled={loading}
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating === 1 && 'Rất tệ'}
              {rating === 2 && 'Tệ'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Tốt'}
              {rating === 5 && 'Rất tốt'}
            </>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {isEditing ? 'Sửa đánh giá' : 'Đánh giá sản phẩm'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex-1">
              <h4 className="font-medium">{product.productName}</h4>
              <p className="text-sm text-gray-600">
                Màu: {product.color} • Số lượng: {product.quantity}
              </p>
            </div>
          </div>

          {!canReview && !isEditing && (
                         <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
               <p className="text-yellow-800 text-sm">
                 Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được thanh toán hoặc giao thành công.
               </p>
             </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Đánh giá của bạn <span className="text-red-500">*</span>
              </label>
              {renderStars()}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={loading}
                required
                minLength={10}
                maxLength={1000}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Tối thiểu 10 ký tự</span>
                <span>{comment.length}/1000</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || (!canReview && !isEditing)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? 'Đang cập nhật...' : 'Đang gửi...'}
                  </div>
                ) : (
                  isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewForm; 