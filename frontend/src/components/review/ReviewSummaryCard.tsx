import React from 'react';
import { Star, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface ReviewSummaryStats {
  totalReviews: number;
  pendingReviews: number;
  averageRating: number;
  canReviewCount: number;
}

interface ReviewSummaryCardProps {
  stats?: ReviewSummaryStats;
  loading?: boolean;
}

const ReviewSummaryCard: React.FC<ReviewSummaryCardProps> = ({
  stats = {
    totalReviews: 0,
    pendingReviews: 0,
    averageRating: 0,
    canReviewCount: 0
  },
  loading = false
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {rating > 0 ? rating.toFixed(1) : 'Chưa có'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        Tổng quan đánh giá
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
          <div className="text-sm text-gray-600">Đã đánh giá</div>
        </div>

        {/* Average Rating */}
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="text-sm text-gray-600">Điểm trung bình</div>
        </div>

        {/* Pending Reviews */}
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
          <div className="text-sm text-gray-600">Chờ duyệt</div>
        </div>

        {/* Can Review */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.canReviewCount}</div>
          <div className="text-sm text-gray-600">Có thể đánh giá</div>
        </div>
      </div>

      {stats.totalReviews > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Đánh giá trung bình của bạn:</span>
            {renderStars(stats.averageRating)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummaryCard; 