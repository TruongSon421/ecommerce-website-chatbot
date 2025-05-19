import { create } from 'zustand';
import { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  selectedItems: string[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  removeItem: (productId: string, color: string) => void;
  toggleSelectItem: (productId: string) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  selectedItems: [],

  addItem: (item: CartItem) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.productId === item.productId && i.color === item.color
      );
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId && i.color === item.color
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),

  updateQuantity: (productId: string, color: string, quantity: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId && item.color === color
          ? { ...item, quantity: quantity > 0 ? quantity : 1 }
          : item
      ),
    })),

  removeItem: (productId: string, color: string) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.productId === productId && item.color === color)
      ),
      selectedItems: state.selectedItems.filter((id) => id !== productId),
    })),

  toggleSelectItem: (productId: string) =>
    set((state) => {
      const isSelected = state.selectedItems.includes(productId);
      if (isSelected) {
        return { selectedItems: state.selectedItems.filter((id) => id !== productId) };
      }
      return { selectedItems: [...state.selectedItems, productId] };
    }),

  clearCart: () => set({ items: [], selectedItems: [] }),

  setItems: (items: CartItem[]) => set({ items }),
}));