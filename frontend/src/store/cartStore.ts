import { create } from 'zustand';
import { CartItem } from '../types/cart';
import { getCookie, setCookie, generateSessionId } from '../components/utils/cookie';

interface CartState {
  items: CartItem[];
  sessionId: string | null;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  removeItem: (productId: string, color: string) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  initializeSession: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  sessionId: null,

  initializeSession: () => {
    let sessionId = getCookie('session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      setCookie('session_id', sessionId);
    }
    const guestCart = getCookie('guest_cart');
    const items = guestCart ? JSON.parse(guestCart) : [];
    set({ sessionId, items });
    console.log('Initialized guest session:', { sessionId, items }); // Log để debug
  },

  addItem: (item: CartItem) => {
    set((state) => {
      const newItems = [...state.items, item];
      setCookie('guest_cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (productId: string, color: string, quantity: number) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.productId === productId && item.color === color ? { ...item, quantity } : item
      );
      setCookie('guest_cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (productId: string, color: string) => {
    set((state) => {
      const newItems = state.items.filter(
        (item) => !(item.productId === productId && item.color === color)
      );
      setCookie('guest_cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    setCookie('guest_cart', JSON.stringify([]));
    set({ items: [], sessionId: null });
  },

  setItems: (items: CartItem[]) => {
    set({ items });
  },
}));