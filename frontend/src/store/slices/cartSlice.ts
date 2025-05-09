import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem } from '../../types/cart';

const initialState: Cart = {
  items: [],
  totalPrice: 0,
};

// Helper function to calculate total price
const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (cart: Cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Helper function to load cart from localStorage
const loadCartFromLocalStorage = (): Cart => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    return JSON.parse(savedCart);
  }
  return initialState;
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromLocalStorage(),
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === newItem.productId && item.color === newItem.color
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        state.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        state.items.push(newItem);
      }

      // Update total price
      state.totalPrice = calculateTotalPrice(state.items);
      
      // Save to localStorage for guest users
      saveCartToLocalStorage(state);
    },
    removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      const { productId } = action.payload;
      state.items = state.items.filter((item) => item.productId !== productId);
      
      // Update total price
      state.totalPrice = calculateTotalPrice(state.items);
      
      // Save to localStorage
      saveCartToLocalStorage(state);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string, quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.productId === productId);
      
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
        
        // Update total price
        state.totalPrice = calculateTotalPrice(state.items);
        
        // Save to localStorage
        saveCartToLocalStorage(state);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      
      // Save to localStorage
      saveCartToLocalStorage(state);
    },
    setCart: (state, action: PayloadAction<Cart>) => {
      state.items = action.payload.items;
      state.totalPrice = calculateTotalPrice(action.payload.items);
      
      // Save to localStorage
      saveCartToLocalStorage(state);
    },
    mergeCart: (state, action: PayloadAction<CartItem[]>) => {
      const serverItems = action.payload;
      
      // For each server item, check if it exists in local cart
      for (const serverItem of serverItems) {
        const existingItemIndex = state.items.findIndex(
          item => item.productId === serverItem.productId && item.color === serverItem.color
        );
        
        if (existingItemIndex >= 0) {
          // If item exists locally, keep the higher quantity
          state.items[existingItemIndex].quantity = Math.max(
            state.items[existingItemIndex].quantity,
            serverItem.quantity
          );
        } else {
          // If item doesn't exist locally, add it
          state.items.push(serverItem);
        }
      }
      
      // Update total price
      state.totalPrice = calculateTotalPrice(state.items);
      
      // Save to localStorage
      saveCartToLocalStorage(state);
    }
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  setCart,
  mergeCart 
} = cartSlice.actions;

export default cartSlice.reducer;