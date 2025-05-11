export interface CartItem {
  productId: string;
  quantity: number;
  color: string;
  productName?: string; // Optional for display
  price?: number; // Optional for display
  type?: string; // Added to store product type (e.g., "PHONE", "LAPTOP")
}

export interface CartResponse {
  items: CartItem[];
}