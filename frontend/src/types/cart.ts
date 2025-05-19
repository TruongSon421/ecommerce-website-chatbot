export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;
  available: boolean;
}

export interface CartResponse {
  userId: string;
  totalPrice: number;
  items: CartItem[];
}

export interface CheckoutRequest {
  userId: string;
  shippingAddress: string;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'COD';
  paymentState: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface CheckoutPayload {
  checkoutRequest: CheckoutRequest;
  selectedItems: CartItem[];
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