export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;
  available: boolean;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt?: string;
  transactionId?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  itemCount?: number;
}

export interface OrderResponse extends Order {}

export interface OrderDetailsResponse {
  id: string;
  transactionId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
}

export interface UserPurchaseHistoryResponse {
  id: string;
  transactionId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface PaginatedOrders {
  orders: OrderResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedPurchaseHistory {
  orders: UserPurchaseHistoryResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedPurchasedItems {
  purchasedItems: OrderItem[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  // Add other statistics fields as returned by API
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PAYMENT_COMPLETED' 
  | 'SHIPPING' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface OrderFilters {
  status?: string;
  userId?: string;
  transactionId?: string;
} 