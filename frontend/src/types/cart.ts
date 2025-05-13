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