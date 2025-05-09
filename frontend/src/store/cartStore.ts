import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  totalPrice: number;
  addItem: (item: CartItem) => void;
  mergeCart: (serverItems: CartItem[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalPrice: 0,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId && i.color === item.color
          );
          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId && i.color === item.color
                ? { ...i, quantity: item.quantity }
                : i
            );
          } else {
            newItems = [...state.items, item];
          }
          const newTotalPrice = newItems.reduce(
            (total, i) => total + i.price * i.quantity,
            0
          );
          return { items: newItems, totalPrice: newTotalPrice };
        }),
      mergeCart: (serverItems) =>
        set((state) => {
          const mergedItems = [...state.items];
          serverItems.forEach((serverItem) => {
            const existingItem = mergedItems.find(
              (i) => i.productId === serverItem.productId && i.color === serverItem.color
            );
            if (existingItem) {
              existingItem.quantity = serverItem.quantity;
              existingItem.isAvailable = serverItem.isAvailable;
            } else {
              mergedItems.push(serverItem);
            }
          });
          const newTotalPrice = mergedItems.reduce(
            (total, i) => total + i.price * i.quantity,
            0
          );
          return { items: mergedItems, totalPrice: newTotalPrice };
        }),
      clearCart: () => set({ items: [], totalPrice: 0 }),
    }),
    { name: 'cart-storage' }
  )
);