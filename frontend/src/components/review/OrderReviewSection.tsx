import React, { useState, useEffect } from 'react';
import { Star, Edit3, MessageSquare } from 'lucide-react';
import { getUserReview } from '../../services/reviewService';
import { ReviewResponse } from '../../types/review';
import { OrderItem } from '../../types/order';
import ProductReviewForm from './ProductReviewForm';

interface OrderReviewSectionProps {
  orderId: string;
  items: OrderItem[];
  orderStatus: string;
}

interface ProductReviewInfo {
  product: OrderItem;
  review: ReviewResponse | null;
  canReview: boolean;
  loading: boolean;
}

const OrderReviewSection: React.FC<OrderReviewSectionProps> = ({
  orderId,
  items,
  orderStatus
}) => {
  const [productReviews, setProductReviews] = useState<ProductReviewInfo[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const canReviewOrder = orderStatus === 'DELIVERED' || orderStatus === 'PAYMENT_COMPLETED';

  useEffect(() => {
    loadProductReviews();
  }, [orderId, items]);

  const loadProductReviews = async () => {
    const reviewInfos: ProductReviewInfo[] = [];

    for (const item of items) {
      reviewInfos.push({
        product: item,
        review: null,
        canReview: canReviewOrder,
        loading: true
      });
    }

    setProductReviews(reviewInfos);

    // Load existing reviews
    for (let i = 0; i < items.length; i++) {
      try {
        const review = await getUserReview(orderId, items[i].productId);
        setProductReviews(prev => prev.map((info, index) => 
          index === i ? { ...info, review, loading: false } : info
        ));
      } catch (error) {
        console.error(`Error loading review for product ${items[i].productId}:`, error);
        setProductReviews(prev => prev.map((info, index) => 
          index === i ? { ...info, loading: false } : info
        ));
      }
    }
  };

  const handleReviewClick = (productInfo: ProductReviewInfo) => {
    setSelectedProduct(productInfo.product);
    setSelectedReview(productInfo.review);
    setShowReviewForm(true);
  };

  const handleReviewSubmitted = (review: ReviewResponse) => {
    // Update the local state with the new/updated review
    setProductReviews(prev => prev.map(info => 
      info.product.productId === review.productId
        ? { ...info, review }
        : info
    ));
  };

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
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (!canReviewOrder) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Đánh giá sản phẩm
        </h4>
        <p className="text-sm text-gray-600">
          Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được thanh toán hoặc giao thành công.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Đánh giá sản phẩm
        </h4>
        
        <div className="space-y-3">
          {productReviews.map((productInfo, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h5 className="font-medium">{productInfo.product.productName}</h5>
                  <p className="text-sm text-gray-600 mb-3">
                    Màu: {productInfo.product.color} • Số lượng: {productInfo.product.quantity}
                  </p>
                  
                  {productInfo.loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Đang tải đánh giá...
                    </div>
                  ) : productInfo.review ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {renderStars(productInfo.review.rating)}
                        <span className="text-sm text-gray-600">
                          {formatDate(productInfo.review.createdAt!)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {productInfo.review.comment}
                      </p>
                      {productInfo.review.status === 'PENDING' && (
                        <p className="text-xs text-yellow-600">
                          Đánh giá đang chờ duyệt
                        </p>
                      )}
                      {productInfo.review.status === 'REJECTED' && (
                        <p className="text-xs text-red-600">
                          Đánh giá bị từ chối: {productInfo.review.rejectionReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có đánh giá</p>
                  )}
                </div>
                
                <button
                  onClick={() => handleReviewClick(productInfo)}
                  className={`ml-4 px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                    productInfo.review
                      ? 'text-blue-600 border border-blue-600 hover:bg-blue-50'
                      : 'text-white bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={productInfo.loading}
                >
                  {productInfo.review ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Sửa đánh giá
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Đánh giá
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showReviewForm && selectedProduct && (
        <ProductReviewForm
          orderId={orderId}
          product={selectedProduct}
          existingReview={selectedReview}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedProduct(null);
            setSelectedReview(null);
          }}
          onReviewSubmitted={handleReviewSubmitted}
          canReview={canReviewOrder}
        />
      )}
    </>
  );
};

export default OrderReviewSection; 