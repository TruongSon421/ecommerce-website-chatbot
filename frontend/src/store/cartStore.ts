import { create } from 'zustand';
import { CartItem } from '../types/cart';

interface CartStore {
  items: CartItem[];
  selectedItems: string[]; // Array of "productId-color" strings
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (productId: string, color: string, quantity: number) => void;
  removeItem: (productId: string, color: string) => void;
  clearCart: () => void;
  toggleSelectItem: (productId: string, color: string) => void;
  selectAllItems: () => void;
  unselectAllItems: () => void;
  getTotalPrice: () => number;
  getSelectedItemsTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  selectedItems: [],

  setItems: (items) => set({ items }),

  addItem: (item) => set((state) => {
    const existingItemIndex = state.items.findIndex(
      (existingItem) => existingItem.productId === item.productId && existingItem.color === item.color
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...state.items];
      updatedItems[existingItemIndex].quantity += item.quantity;
      return { items: updatedItems };
    } else {
      return { items: [...state.items, item] };
    }
  }),

  updateItem: (productId, color, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.productId === productId && item.color === color
        ? { ...item, quantity }
        : item
    ),
  })),

  removeItem: (productId, color) => set((state) => ({
    items: state.items.filter((item) => !(item.productId === productId && item.color === color)),
    selectedItems: state.selectedItems.filter((selected) => selected !== `${productId}-${color}`),
  })),

  clearCart: () => set({ items: [], selectedItems: [] }),

  toggleSelectItem: (productId, color) => set((state) => {
    const itemKey = `${productId}-${color}`;
    const isSelected = state.selectedItems.includes(itemKey);
    
    if (isSelected) {
      return {
        selectedItems: state.selectedItems.filter((selected) => selected !== itemKey),
      };
    } else {
      return {
        selectedItems: [...state.selectedItems, itemKey],
      };
    }
  }),

  selectAllItems: () => set((state) => ({
    selectedItems: state.items.map((item) => `${item.productId}-${item.color}`),
  })),

  unselectAllItems: () => set({ selectedItems: [] }),

  getTotalPrice: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getSelectedItemsTotal: () => {
    const state = get();
    return state.items
      .filter((item) => state.selectedItems.includes(`${item.productId}-${item.color}`))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  },
})); 