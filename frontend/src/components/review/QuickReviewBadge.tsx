import React from 'react';
import { Star, CheckCircle, Clock } from 'lucide-react';

interface QuickReviewBadgeProps {
  hasReviewed: boolean;
  canReview: boolean;
  orderStatus: string;
  itemCount: number;
  reviewedCount?: number;
}

const QuickReviewBadge: React.FC<QuickReviewBadgeProps> = ({
  hasReviewed,
  canReview,
  orderStatus,
  itemCount,
  reviewedCount = 0
}) => {
  if (orderStatus !== 'DELIVERED' && orderStatus !== 'PAYMENT_COMPLETED') {
    return null;
  }

  if (reviewedCount === itemCount && reviewedCount > 0) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs">
        <CheckCircle className="w-3 h-3" />
        <span>Đã đánh giá ({reviewedCount}/{itemCount} SP)</span>
      </div>
    );
  }

  if (reviewedCount > 0) {
    return (
      <div className="flex items-center gap-1 text-orange-600 text-xs">
        <Star className="w-3 h-3" />
        <span>Đã đánh giá một phần ({reviewedCount}/{itemCount} SP)</span>
      </div>
    );
  }

  if (canReview) {
    return (
      <div className="flex items-center gap-1 text-yellow-600 text-xs">
        <Star className="w-3 h-3" />
        <span>Có thể đánh giá ({itemCount} SP)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-gray-500 text-xs">
      <Clock className="w-3 h-3" />
      <span>Chờ đánh giá</span>
    </div>
  );
};

export default QuickReviewBadge; 