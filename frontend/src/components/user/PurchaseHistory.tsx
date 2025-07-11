import React, { useState, useEffect } from 'react';
import { getUserPurchaseHistory } from '../../services/orderService';
import { getUserReviews } from '../../services/reviewService';
import { PaginatedPurchaseHistory, UserPurchaseHistoryResponse, OrderStatus } from '../../types/order';
import { ReviewResponse } from '../../types/review';
import OrderReviewSection from '../review/OrderReviewSection';
import QuickReviewBadge from '../review/QuickReviewBadge';
import ReviewSummaryCard from '../review/ReviewSummaryCard';
import { shouldShowColor } from '../../utils/colorUtils';

const PurchaseHistory: React.FC = () => {
  const [purchaseHistory, setPurchaseHistory] = useState<PaginatedPurchaseHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<UserPurchaseHistoryResponse | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [userReviews, setUserReviews] = useState<ReviewResponse[]>([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    averageRating: 0,
    canReviewCount: 0
  });

  useEffect(() => {
    loadPurchaseHistory();
  }, [currentPage, sortBy, sortDir, statusFilter]);

  useEffect(() => {
    loadUserReviews();
  }, []);

  useEffect(() => {
    if (purchaseHistory && userReviews.length >= 0) {
      calculateReviewStats(purchaseHistory);
    }
  }, [userReviews, purchaseHistory]);

  const loadPurchaseHistory = async () => {
    try {
      setLoading(true);
      const data = await getUserPurchaseHistory(
        currentPage,
        pageSize,
        sortBy,
        sortDir,
        statusFilter || undefined
      );
      setPurchaseHistory(data);
    } catch (error) {
      console.error('Error loading purchase history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async () => {
    try {
      const reviews = await getUserReviews();
      setUserReviews(reviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const calculateReviewStats = (purchaseData: PaginatedPurchaseHistory) => {
    if (!purchaseData) return;

    const deliveredOrders = purchaseData.orders.filter(
      order => order.status === 'DELIVERED' || order.status === 'PAYMENT_COMPLETED'
    );
    
    const totalItemsCanReview = deliveredOrders.reduce((sum, order) => sum + order.items.length, 0);
    const reviewedItems = userReviews.length;
    const pendingItems = userReviews.filter(review => review.status === 'PENDING').length;
    const averageRating = userReviews.length > 0 
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
      : 0;

    setReviewStats({
      totalReviews: reviewedItems,
      pendingReviews: pendingItems,
      averageRating: Number(averageRating.toFixed(1)),
      canReviewCount: Math.max(0, totalItemsCanReview - reviewedItems)
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PAYMENT_COMPLETED': 'bg-green-100 text-green-800',
      'SHIPPING': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-200 text-green-900',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'PAYMENT_COMPLETED': 'Đã thanh toán',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'CANCELLED': 'Đã hủy',
    };
    
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

<<<<<<< HEAD
=======
  const getPaymentMethodText = (method: string) => {
    const paymentMethods = {
      'TRANSFER_BANKING': 'Chuyển khoản ngân hàng',
      'CASH_ON_DELIVERY': 'Thanh toán khi nhận hàng',
      'CREDIT_CARD': 'Thẻ tín dụng',
      'DEBIT_CARD': 'Thẻ ghi nợ',
      'E_WALLET': 'Ví điện tử',
      'MOMO': 'MoMo',
      'ZALOPAY': 'ZaloPay',
      'VNPAY': 'VNPay',
    };
    
    return paymentMethods[method as keyof typeof paymentMethods] || method;
  };

>>>>>>> server
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleViewDetails = (order: UserPurchaseHistoryResponse) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleReviewUpdate = () => {
    // Reload user reviews when a review is submitted/updated
    loadUserReviews();
  };

  const getProductReviewStatus = (productId: string) => {
    const review = userReviews.find(r => r.productId === productId);
    return review || null;
  };

  const hasReviewedProduct = (productId: string) => {
    return userReviews.some(review => review.productId === productId);
  };

  // Flatten all items from all orders into a single list
  const getAllPurchasedItems = () => {
    if (!purchaseHistory) return [];
    
    const allItems: Array<{
      orderId: string;
      orderDate: string;
      orderStatus: string;
      transactionId: string;
<<<<<<< HEAD
      item: any;
      totalPrice: number;
=======
      shippingAddress: string;
      paymentMethod: string;
      item: any;
      totalPrice: number;
      originalOrder: UserPurchaseHistoryResponse;
>>>>>>> server
    }> = [];

    purchaseHistory.orders.forEach(order => {
      order.items.forEach(item => {
        allItems.push({
          orderId: order.id,
          orderDate: order.createdAt,
          orderStatus: order.status,
          transactionId: order.transactionId,
<<<<<<< HEAD
          item: item,
          totalPrice: item.price * item.quantity
=======
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          item: item,
          totalPrice: item.price * item.quantity,
          originalOrder: order
>>>>>>> server
        });
      });
    });

    return allItems;
  };

  const renderOrderDetailsModal = () => {
    if (!showOrderDetails || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Chi tiết đơn hàng</h3>
            <button
              onClick={() => setShowOrderDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Thông tin đơn hàng</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Mã đơn hàng:</span> {selectedOrder.id}</div>
                <div><span className="font-medium">Mã giao dịch:</span> {selectedOrder.transactionId}</div>
                <div><span className="font-medium">Ngày đặt:</span> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</div>
                <div>
                  <span className="font-medium">Trạng thái:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
<<<<<<< HEAD
                <div><span className="font-medium">Phương thức thanh toán:</span> {selectedOrder.paymentMethod}</div>
=======
                <div><span className="font-medium">Phương thức thanh toán:</span> {getPaymentMethodText(selectedOrder.paymentMethod)}</div>
>>>>>>> server
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Địa chỉ giao hàng</h4>
              <p className="text-sm text-gray-700">{selectedOrder.shippingAddress}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold mb-4">Sản phẩm đã đặt</h4>
            <div className="divide-y border rounded-lg">
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <h5 className="font-medium">{item.productName}</h5>
                    <div className="text-sm text-gray-600">
                      {shouldShowColor(item.color) && <span>Màu: {item.color}</span>}
                      <span className={shouldShowColor(item.color) ? "ml-4" : ""}>Số lượng: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.price)}</div>
                    <div className="text-sm text-gray-600">
                      Tổng: {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-semibold">Tổng cộng:</span>
            <span className="text-xl font-bold text-green-600">
              {formatCurrency(selectedOrder.totalAmount)}
            </span>
          </div>

          {/* Product Reviews Section */}
          <OrderReviewSection
            orderId={selectedOrder.id}
            items={selectedOrder.items}
            orderStatus={selectedOrder.status}
            onReviewUpdate={handleReviewUpdate}
          />
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (!purchaseHistory || purchaseHistory.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Trước
          </button>
          
          <span className="px-3 py-1 bg-gray-100 rounded">
            {currentPage + 1} / {purchaseHistory.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(purchaseHistory.totalPages - 1, prev + 1))}
            disabled={currentPage >= purchaseHistory.totalPages - 1}
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
          <p className="mt-4 text-gray-600">Đang tải lịch sử mua hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sản phẩm đã mua</h1>
      </div>

      {/* Review Summary */}
      <ReviewSummaryCard 
        stats={reviewStats}
        loading={loading}
      />

      {/* Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PAYMENT_COMPLETED">Đã thanh toán</option>
              <option value="SHIPPING">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sắp xếp:</label>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDir(direction);
                setCurrentPage(0);
              }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="totalAmount-desc">Giá cao nhất</option>
              <option value="totalAmount-asc">Giá thấp nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {getAllPurchasedItems().length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Bạn chưa mua sản phẩm nào</p>
          </div>
        ) : (
          getAllPurchasedItems().map((purchasedItem, index) => {
            const canReview = purchasedItem.orderStatus === 'DELIVERED' || purchasedItem.orderStatus === 'PAYMENT_COMPLETED';
            const hasReviewed = hasReviewedProduct(purchasedItem.item.productId);
            const reviewStatus = getProductReviewStatus(purchasedItem.item.productId);
            
            return (
              <div key={`${purchasedItem.orderId}-${purchasedItem.item.productId}-${index}`} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{purchasedItem.item.productName}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          {shouldShowColor(purchasedItem.item.color) && <div>Màu sắc: <span className="font-medium">{purchasedItem.item.color}</span></div>}
                          <div>Số lượng: <span className="font-medium">{purchasedItem.item.quantity}</span></div>
                          <div>Đơn giá: <span className="font-medium">{formatCurrency(purchasedItem.item.price)}</span></div>
                          <div>Tổng tiền: <span className="font-medium text-green-600">{formatCurrency(purchasedItem.totalPrice)}</span></div>
<<<<<<< HEAD
=======
                          <div>Địa chỉ giao hàng: <span className="font-medium">{purchasedItem.shippingAddress}</span></div>
                          <div>Phương thức thanh toán: <span className="font-medium">{getPaymentMethodText(purchasedItem.paymentMethod)}</span></div>
>>>>>>> server
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(purchasedItem.orderStatus)}`}>
                            {getStatusText(purchasedItem.orderStatus)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Mua ngày: {new Date(purchasedItem.orderDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end gap-2">
                    {/* Review Status */}
                    <div className="text-right">
                      {hasReviewed && reviewStatus ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đã đánh giá
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= reviewStatus.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                            <span className="text-sm text-gray-600 ml-1">({reviewStatus.rating})</span>
                          </div>
                          {reviewStatus.status === 'PENDING' && (
                            <p className="text-xs text-yellow-600">Chờ duyệt</p>
                          )}
                        </div>
                      ) : canReview ? (
                        <div className="flex items-center gap-1 text-yellow-600 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Có thể đánh giá
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Chưa thể đánh giá
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {canReview && (
                        <button
                          onClick={() => {
<<<<<<< HEAD
                            const mockOrder = {
                              id: purchasedItem.orderId,
                              transactionId: purchasedItem.transactionId,
                              createdAt: purchasedItem.orderDate,
                              status: purchasedItem.orderStatus,
                              totalAmount: purchasedItem.totalPrice,
                              shippingAddress: 'Địa chỉ giao hàng',
                              paymentMethod: 'Thanh toán online',
                              items: [purchasedItem.item]
                            };
                            handleViewDetails(mockOrder);
=======
                            handleViewDetails(purchasedItem.originalOrder);
>>>>>>> server
                          }}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                            hasReviewed
                              ? 'text-blue-600 border border-blue-600 hover:bg-blue-50'
                              : 'text-white bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {hasReviewed ? 'Sửa đánh giá' : 'Đánh giá'}
                        </button>
                      )}
                      
                      <div className="text-xs text-gray-500 text-center">
                        Đơn #{purchasedItem.orderId}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {renderPagination()}
      {renderOrderDetailsModal()}
    </div>
  );
};

export default PurchaseHistory; 