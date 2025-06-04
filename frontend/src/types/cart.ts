export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;
  available: boolean;
}

export interface CartItemIdentity {
  productId: string;
  color: string;
}

export interface CartResponse {
  userId: string;
  totalPrice: number;
  items: CartItem[];
}

export interface CheckoutRequest {
  userId: string;
  shippingAddress: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER_BANKING' | 'COD' | 'QR_CODE';
}

export interface CheckoutPayload {
  checkoutRequest: CheckoutRequest;
  selectedItems: CartItemIdentity[];
}

// New types for the updated payment flow
export interface CheckoutResponse {
  transactionId: string;
  orderId?: string;
  message?: string;
}

export interface PaymentUrlResponse {
  paymentUrl: string;
  transactionId: string;
}

export interface PaymentStatusResponse {
  exists: boolean;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  paymentMethod?: string;
  amount?: string;
  orderId?: number;
  userId?: string;
  failureReason?: string;
  message?: string;
}

export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  district_code: number;
}