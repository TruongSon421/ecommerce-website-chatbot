import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, RefreshCw, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;
}

interface Order {
  orderId: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  transactionId: string;
  shippingAddress: string;
  paymentMethod: string;
  itemCount: number;
}

interface OrderDetails extends Order {
  items: OrderItem[];
}

interface OrderStatistics {
  totalOrders: number;
  ordersByStatus: { [key: string]: number };
  recentOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [transactionIdFilter, setTransactionIdFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Statistics
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);

  const orderStatuses = [
    'CREATED', 'RESERVING', 'FAILED', 'PAYMENT_PENDING', 
    'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PROCESSING', 
    'SHIPPED', 'DELIVERED', 'CANCELLED'
  ];

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'CREATED': 'bg-blue-100 text-blue-800',
      'RESERVING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800',
      'PAYMENT_PENDING': 'bg-orange-100 text-orange-800',
      'PAYMENT_COMPLETED': 'bg-green-100 text-green-800',
      'PAYMENT_FAILED': 'bg-red-100 text-red-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: { [key: string]: React.ReactNode } = {
      'CREATED': <Clock className="w-4 h-4" />,
      'RESERVING': <AlertCircle className="w-4 h-4" />,
      'FAILED': <XCircle className="w-4 h-4" />,
      'PAYMENT_PENDING': <Clock className="w-4 h-4" />,
      'PAYMENT_COMPLETED': <CheckCircle className="w-4 h-4" />,
      'PAYMENT_FAILED': <XCircle className="w-4 h-4" />,
      'PROCESSING': <Package className="w-4 h-4" />,
      'SHIPPED': <Package className="w-4 h-4" />,
      'DELIVERED': <CheckCircle className="w-4 h-4" />,
      'CANCELLED': <XCircle className="w-4 h-4" />
    };
    return statusIcons[status] || <Clock className="w-4 h-4" />;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { getAllOrdersForAdmin } = await import('../../services/orderService');
      
      const filters = {
        status: statusFilter || undefined,
        userId: userIdFilter || undefined,
        transactionId: transactionIdFilter || undefined
      };

      const data = await getAllOrdersForAdmin(
        currentPage,
        pageSize,
        sortBy,
        sortDir,
        filters
      );
      
      setOrders(data.orders.map(order => ({
        orderId: order.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt || new Date().toISOString(),
        transactionId: order.transactionId || '',
        shippingAddress: order.shippingAddress || '',
        paymentMethod: order.paymentMethod || '',
        itemCount: order.itemCount || 0
      })));
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const { getOrderStatistics } = await import('../../services/orderService');
      const data = await getOrderStatistics();
      setStatistics({
        totalOrders: data.totalOrders,
        ordersByStatus: {
          pending: data.pendingOrders,
          completed: data.completedOrders,
          cancelled: data.cancelledOrders
        },
        recentOrders: data.totalOrders, // Placeholder
        totalRevenue: data.totalRevenue,
        monthlyRevenue: data.totalRevenue // Placeholder - should be calculated monthly
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { getOrderDetailsForAdmin } = await import('../../services/orderService');
      const data = await getOrderDetailsForAdmin(orderId);
      setSelectedOrder({
        orderId: data.id,
        userId: data.userId,
        totalAmount: data.totalAmount,
        status: data.status,
        createdAt: new Date().toISOString(), // Should come from API
        transactionId: data.transactionId,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        itemCount: data.items.length,
        items: data.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          color: item.color
        }))
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { updateOrderStatus: updateStatus } = await import('../../services/orderService');
      await updateStatus(orderId, status);
      
      // Refresh orders list
      fetchOrders();
      setShowUpdateStatusModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders();
  };

  const clearFilters = () => {
    setStatusFilter('');
    setUserIdFilter('');
    setTransactionIdFilter('');
    setSearchTerm('');
    setCurrentPage(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, sortBy, sortDir]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả đơn hàng</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Thống kê
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStatistics && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Đơn hàng gần đây</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.recentOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalRevenue)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Doanh thu tháng</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.monthlyRevenue)}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              {orderStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="Nhập User ID"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
            <input
              type="text"
              value={transactionIdFilter}
              onChange={(e) => setTransactionIdFilter(e.target.value)}
              placeholder="Nhập Transaction ID"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDir(direction);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">Ngày tạo (Mới nhất)</option>
              <option value="createdAt-asc">Ngày tạo (Cũ nhất)</option>
              <option value="totalAmount-desc">Giá trị (Cao nhất)</option>
              <option value="totalAmount-asc">Giá trị (Thấp nhất)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Danh sách đơn hàng ({totalElements} đơn hàng)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order.orderId ? order.orderId.slice(-8) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.userId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.itemCount} sản phẩm
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            fetchOrderDetails(order.orderId);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order as OrderDetails);
                            setNewStatus(order.status);
                            setShowUpdateStatusModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Cập nhật trạng thái"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị {currentPage * pageSize + 1} đến {Math.min((currentPage + 1) * pageSize, totalElements)} trong {totalElements} kết quả
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.orderId ? selectedOrder.orderId.slice(-8) : 'N/A'}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Transaction ID:</span> {selectedOrder.transactionId}</p>
                    <p><span className="font-medium">User ID:</span> {selectedOrder.userId}</p>
                    <p><span className="font-medium">Trạng thái:</span> 
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Phương thức thanh toán:</span> {selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Địa chỉ giao hàng</h3>
                  <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {selectedOrder.items && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Sản phẩm đã đặt</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Màu sắc</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500">ID: {item.productId}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.color}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <div className="text-lg font-bold">
                      Tổng cộng: {formatCurrency(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Cập nhật trạng thái đơn hàng</h2>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Đơn hàng: #{selectedOrder.orderId ? selectedOrder.orderId.slice(-8) : 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-4">Trạng thái hiện tại: {selectedOrder.status}</p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái mới:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUpdateStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.orderId, newStatus)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
