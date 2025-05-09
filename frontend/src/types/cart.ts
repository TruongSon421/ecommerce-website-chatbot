export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    color: string;
    isAvailable?: boolean;
  }
  
  export interface CartState {
    items: CartItem[];
    totalPrice: number;
    addItem: (item: CartItem) => void;
    removeItem: (productId: string, color: string) => void;
    clearCart: () => void;
    mergeCart: (serverItems: CartItem[]) => void;
  }