import React, { useState, useEffect } from 'react';
import {
  getPendingReviews,
  getAllProductReviews,
  approveReview,
  rejectReview,
  adminDeleteReview,
  toggleReviewVisibility
} from '../../services/reviewService';
import { productApi } from '../../services/productService';
import { PaginatedReviews, ReviewResponse } from '../../types/review';

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<PaginatedReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [productIdFilter, setProductIdFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [productCache, setProductCache] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadReviews();
  }, [currentPage, activeTab, productIdFilter]);

  // Fetch product information and cache it
  const getProductName = async (productId: string): Promise<string> => {
    // Check cache first
    if (productCache[productId]) {
      return productCache[productId];
    }

    try {
      let productName: string;
      
      // Only try to fetch if productId can be parsed as number
      if (!isNaN(Number(productId))) {
        const product = await productApi.getProductById(parseInt(productId));
        productName = product.name || `Product ${productId}`;
      } else {
        // For non-numeric IDs (like MongoDB ObjectId), use fallback
        productName = `Sản phẩm #${productId.slice(-6)}`;
      }
      
      // Cache the result
      setProductCache(prev => ({
        ...prev,
        [productId]: productName
      }));
      
      return productName;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      const fallbackName = `Sản phẩm #${productId.slice(-6)}`;
      
      // Cache the fallback
      setProductCache(prev => ({
        ...prev,
        [productId]: fallbackName
      }));
      
      return fallbackName;
    }
  };

  // Load product names for all reviews
  const loadProductNames = async (reviewList: ReviewResponse[]) => {
    const uniqueProductIds = [...new Set(reviewList.map(review => review.productId))];
    const newProductCache = { ...productCache };
    
    await Promise.all(
      uniqueProductIds.map(async (productId) => {
        if (!newProductCache[productId]) {
          try {
            // Only try to fetch if productId can be parsed as number
            if (!isNaN(Number(productId))) {
              const parsedId = parseInt(productId);
              const product = await productApi.getProductById(parsedId);
              newProductCache[productId] = product.name || `Product ${productId}`;
            } else {
              // For non-numeric IDs (like MongoDB ObjectId), use fallback
              newProductCache[productId] = `Sản phẩm #${productId.slice(-6)}`;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            // Use fallback name when product not found
            newProductCache[productId] = `Sản phẩm #${productId.slice(-6)}`;
          }
        }
      })
    );
    
    setProductCache(newProductCache);
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      let data: PaginatedReviews;
      
      if (activeTab === 'pending') {
        data = await getPendingReviews(currentPage, pageSize);
      } else if (productIdFilter) {
        data = await getAllProductReviews(productIdFilter, currentPage, pageSize);
      } else {
        // Nếu không có productId filter, load pending reviews
        data = await getPendingReviews(currentPage, pageSize);
      }
      
      setReviews(data);
      
      // Load product names for all reviews
      if (data.content.length > 0) {
        await loadProductNames(data.content);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn duyệt đánh giá này?')) return;
    
    try {
      setSubmitting(true);
      await approveReview(reviewId);
      await loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Có lỗi xảy ra khi duyệt đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = (review: ReviewResponse) => {
    setSelectedReview(review);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedReview || !rejectReason.trim()) return;
    
    try {
      setSubmitting(true);
      await rejectReview(selectedReview.id, rejectReason);
      setShowRejectModal(false);
      setSelectedReview(null);
      setRejectReason('');
      await loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Có lỗi xảy ra khi từ chối đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) return;
    
    try {
      setSubmitting(true);
      await adminDeleteReview(reviewId);
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (reviewId: string, visible: boolean) => {
    try {
      setSubmitting(true);
      await toggleReviewVisibility(reviewId, visible);
      await loadReviews();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái hiển thị');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Từ chối' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderRejectModal = () => {
    if (!showRejectModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Từ chối đánh giá</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Lý do từ chối *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={4}
              placeholder="Nhập lý do từ chối đánh giá..."
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedReview(null);
                setRejectReason('');
              }}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={submitting || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : 'Từ chối'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (!reviews || reviews.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Trước
          </button>
          
          <span className="px-3 py-1 bg-gray-100 rounded">
            {currentPage + 1} / {reviews.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(reviews.totalPages - 1, prev + 1))}
            disabled={currentPage >= reviews.totalPages - 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Tab Selection */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => {
                setActiveTab('pending');
                setCurrentPage(0);
                setProductIdFilter('');
              }}
              className={`px-4 py-2 ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(0);
              }}
              className={`px-4 py-2 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Theo sản phẩm
            </button>
          </div>

          {/* Product ID Filter */}
          {activeTab === 'all' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Product ID:</label>
              <input
                type="text"
                value={productIdFilter}
                onChange={(e) => setProductIdFilter(e.target.value)}
                placeholder="Nhập Product ID"
                className="px-3 py-2 border rounded-lg w-64"
              />
              <button
                onClick={() => {
                  setCurrentPage(0);
                  loadReviews();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tìm kiếm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow">
        {reviews?.content.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có đánh giá nào</p>
            {activeTab === 'pending' && (
              <p className="text-sm text-gray-400 mt-2">
                Không có đánh giá nào đang chờ duyệt
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {reviews?.content.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold">{review.username}</span>
                      {getStatusBadge(review.isApproved ? 'APPROVED' : 'PENDING')}
                      {!review.isVisible && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Ẩn
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500 font-medium">
                        Sản phẩm: {productCache[review.productId] || 'Đang tải...'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleString('vi-VN')}
                      {review.adminNote && (
                        <span className="block mt-1 text-red-600">
                          Ghi chú admin: {review.adminNote}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {!review.isApproved && (
                      <>
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={submitting}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectClick(review)}
                          disabled={submitting}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    
                    {review.isApproved && (
                      <button
                        onClick={() => handleToggleVisibility(review.id, !review.isVisible)}
                        disabled={submitting}
                        className={`px-3 py-1 text-white text-sm rounded disabled:opacity-50 ${
                          review.isVisible 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {review.isVisible ? 'Ẩn' : 'Hiện'}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={submitting}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {renderPagination()}
      </div>

      {renderRejectModal()}
    </div>
  );
};

export default ReviewManagement; 