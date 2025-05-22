import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartState } from '../types/cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: [],
      uniqueItemCount: 0,

      addItem: (item: CartItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.color === item.color
          );
          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            newItems = [...state.items, item];
          }
          const uniqueItems = new Set(
            newItems.map((i) => `${i.productId}-${i.color}`)
          );
          return {
            items: newItems,
            uniqueItemCount: uniqueItems.size,
          };
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
        set((state) => {
          const newItems = state.items.filter(
            (item) => !(item.productId === productId && item.color === color)
          );
          const uniqueItems = new Set(
            newItems.map((i) => `${i.productId}-${i.color}`)
          );
          return {
            items: newItems,
            selectedItems: state.selectedItems.filter((id) => id !== `${productId}-${color}`),
            uniqueItemCount: uniqueItems.size,
          };
        }),

      toggleSelectItem: (productId: string, color: string) =>
        set((state) => {
          const itemKey = `${productId}-${color}`;
          const isSelected = state.selectedItems.includes(itemKey);
          if (isSelected) {
            return { selectedItems: state.selectedItems.filter((id) => id !== itemKey) };
          }
          return { selectedItems: [...state.selectedItems, itemKey] };
        }),

      clearCart: () =>
        set({
          items: [],
          selectedItems: [],
          uniqueItemCount: 0,
        }),

      setItems: (items: CartItem[]) =>
        set((state) => {
          const uniqueItems = new Set(
            items.map((i) => `${i.productId}-${i.color}`)
          );
          return {
            items,
            uniqueItemCount: uniqueItems.size,
          };
        }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ uniqueItemCount: state.uniqueItemCount }), // Persist only uniqueItemCount
    }
  )
);
