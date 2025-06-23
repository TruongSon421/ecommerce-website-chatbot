import api from '../config/axios';
import {
  OrderResponse,
  OrderDetailsResponse,
  UserPurchaseHistoryResponse,
  PaginatedOrders,
  PaginatedPurchaseHistory,
  PaginatedPurchasedItems,
  OrderStatistics,
  OrderFilters
} from '../types/order';

const BASE_URL = '/orders';

// ===== EXISTING FUNCTIONALITY =====

/**
 * Fetches order details using the transaction ID.
 * This is useful for the PaymentPage to display what the user is paying for.
 */
export const fetchOrderDetailsByTransactionId = async (transactionId: string): Promise<OrderDetailsResponse> => {
  try {
    const response = await api.get<OrderDetailsResponse>(`${BASE_URL}/transaction/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for transaction ${transactionId}:`, error);
    throw new Error('Failed to fetch order details');
  }
};

// ===== USER ENDPOINTS =====

/**
 * Lấy lịch sử mua hàng của user
 */
export const getUserPurchaseHistory = async (
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc',
  status?: string
): Promise<PaginatedPurchaseHistory> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });
  
  if (status) {
    params.append('status', status);
  }
  
  const response = await api.get(`${BASE_URL}/user/purchase-history?${params}`);
  return response.data;
};

/**
 * Lấy các item đã mua của user
 */
export const getUserPurchasedItems = async (
  page: number = 0,
  size: number = 20
): Promise<PaginatedPurchasedItems> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  const response = await api.get(`${BASE_URL}/user/purchased-items?${params}`);
  return response.data;
};

/**
 * Lấy đơn hàng theo ID
 */
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
  const response = await api.get(`${BASE_URL}/${orderId}`);
  return response.data;
};

/**
 * Hủy đơn hàng
 */
export const cancelOrder = async (orderId: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${orderId}`);
};

/**
 * Xác nhận đơn hàng
 */
export const confirmOrder = async (orderId: string): Promise<void> => {
  await api.post(`${BASE_URL}/${orderId}/confirm`);
};

/**
 * Kiểm tra user đã mua sản phẩm chưa
 */
export const checkIfUserPurchasedProduct = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  const params = new URLSearchParams({
    userId,
    productId,
  });
  
  const response = await api.get(`${BASE_URL}/check-purchased?${params}`);
  return response.data;
};

// ===== ADMIN ENDPOINTS =====

/**
 * Lấy tất cả đơn hàng cho admin
 */
export const getAllOrdersForAdmin = async (
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc',
  filters?: OrderFilters
): Promise<PaginatedOrders> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });
  
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.userId) {
    params.append('userId', filters.userId);
  }
  if (filters?.transactionId) {
    params.append('transactionId', filters.transactionId);
  }
  
  const response = await api.get(`${BASE_URL}/admin/all?${params}`);
  return response.data;
};

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  const params = new URLSearchParams({ status });
  await api.put(`${BASE_URL}/admin/${orderId}/status?${params}`);
};

/**
 * Lấy chi tiết đơn hàng cho admin
 */
export const getOrderDetailsForAdmin = async (orderId: string): Promise<OrderDetailsResponse> => {
  const response = await api.get(`${BASE_URL}/admin/${orderId}/details`);
  return response.data;
};

/**
 * Lấy thống kê đơn hàng (Admin)
 */
export const getOrderStatistics = async (): Promise<OrderStatistics> => {
  const response = await api.get(`${BASE_URL}/admin/statistics`);
  return response.data;
};