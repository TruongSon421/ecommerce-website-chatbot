import axios from '../config/axios';
import { useCartStore } from '../store/cartStore';
import { CartItem } from '../types/cart';

const API_URL = 'http://localhost:8070/api/carts';

export const addItemToCart = async (item: CartItem, isAuthenticated: boolean) => {
  if (isAuthenticated) {
    try {
      const response = await axios.post(`${API_URL}/items`, {
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
      });
      useCartStore.getState().mergeCart(response.data.items);
      return response.data;
    } catch (error) {
      console.error('Failed to add item to server cart:', error);
      throw error;
    }
  }
  useCartStore.getState().addItem(item);
};

export const getCartItems = async (isAuthenticated: boolean): Promise<CartItem[]> => {
  if (isAuthenticated) {
    try {
      const response = await axios.get(`${API_URL}`);
      return response.data.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        isAvailable: item.isAvailable,
      }));
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      return [];
    }
  }
  return useCartStore.getState().items;
};

export const updateCartItem = async (productId: string, quantity: number, color: string) => {
  try {
    const response = await axios.put(`${API_URL}/items/${productId}`, null, {
      params: { quantity, color },
    });
    useCartStore.getState().mergeCart(response.data.items);
    return response.data;
  } catch (error) {
    console.error('Failed to update cart item:', error);
    throw error;
  }
};

export const removeItemFromCart = async (productId: string, color: string) => {
  try {
    const response = await axios.delete(`${API_URL}/items/${productId}`, {
      params: { color },
    });
    useCartStore.getState().mergeCart(response.data.items);
    return response.data;
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    await axios.delete(`${API_URL}`);
    useCartStore.getState().clearCart();
  } catch (error) {
    console.error('Failed to clear cart:', error);
    throw error;
  }
};

export const mergeCart = async (userId: string) => {
  const localItems = useCartStore.getState().items;
  if (localItems.length > 0) {
    try {
      // Prepare payload in the required format
      const payload = {
        userId,
        items: localItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
        })),
      };

      const response = await axios.post(`${API_URL}/merge`, payload);
      useCartStore.getState().mergeCart(response.data.items);
      return response.data;
    } catch (error) {
      console.error('Failed to merge cart:', error);
      throw error;
    }
  }
};