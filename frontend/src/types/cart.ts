export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;
  available: boolean;
  productType?: string;
}

export interface CartResponse {
  userId: string;
  totalPrice: number;
  items: CartItem[];
}