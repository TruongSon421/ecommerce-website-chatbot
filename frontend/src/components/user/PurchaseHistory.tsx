import React, { useState, useEffect } from 'react';
import { getUserPurchaseHistory } from '../../services/orderService';
import { PaginatedPurchaseHistory, UserPurchaseHistoryResponse, OrderStatus } from '../../types/order';
import OrderReviewSection from '../review/OrderReviewSection';
import QuickReviewBadge from '../review/QuickReviewBadge';
import ReviewSummaryCard from '../review/ReviewSummaryCard';

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

  useEffect(() => {
    loadPurchaseHistory();
  }, [currentPage, sortBy, sortDir, statusFilter]);

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
                <div><span className="font-medium">Phương thức thanh toán:</span> {selectedOrder.paymentMethod}</div>
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
                      <span>Màu: {item.color}</span>
                      <span className="ml-4">Số lượng: {item.quantity}</span>
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
        <h1 className="text-2xl font-bold">Lịch sử mua hàng</h1>
      </div>

      {/* Review Summary */}
      <ReviewSummaryCard 
        stats={{
          totalReviews: 0, // This would come from API
          pendingReviews: 0,
          averageRating: 0,
          canReviewCount: purchaseHistory?.orders.filter(order => order.status === 'DELIVERED' || order.status === 'PAYMENT_COMPLETED').length || 0
        }}
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

      {/* Orders List */}
      <div className="space-y-4">
        {purchaseHistory?.orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          purchaseHistory?.orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold">Đơn hàng #{order.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Mã giao dịch: {order.transactionId}</div>
                    <div>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                    <div className="mt-2">
                      <QuickReviewBadge
                        hasReviewed={false} // This would come from API
                        canReview={order.status === 'DELIVERED' || order.status === 'PAYMENT_COMPLETED'}
                        orderStatus={order.status}
                        itemCount={order.items.length}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 mb-2">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div className="flex gap-2">
                    {(order.status === 'DELIVERED' || order.status === 'PAYMENT_COMPLETED') && (
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Đánh giá
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Sản phẩm ({order.items.length} món)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.productName}</div>
                        <div className="text-xs text-gray-600">
                          {item.color} × {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center p-2 bg-gray-100 rounded text-gray-600 text-sm">
                      +{order.items.length - 3} sản phẩm khác
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {renderPagination()}
      {renderOrderDetailsModal()}
    </div>
  );
};

export default PurchaseHistory; 