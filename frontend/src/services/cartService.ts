import axios from '../config/axios';
import { CartItem, CartResponse } from '../types/cart';
import { useCartStore } from '../store/cartStore';

export const addItemToCart = async (userId: string, item: CartItem): Promise<void> => {
  try {
    const { productId, quantity, color } = item;
    console.log('Adding item to cart for user:', userId, 'Item:', { productId, quantity, color });
    const response = await axios.post<CartResponse>('/carts/items', { productId, quantity, color }, {
      headers: {
        'X-Auth-UserId': userId,
      },
    });
    console.log('Added item to cart:', response.data);

    const updatedItems = response.data.items.map((serverItem) => ({
      ...serverItem,
      color: serverItem.color ?? null, // Normalize null color
      type: item.type || 'phone', // Preserve or set default
      productName: item.productName, // Ensure productName is undefined, not null
    }));
    useCartStore.getState().setItems(updatedItems);
  } catch (error: any) {
    console.error('Failed to add item to cart:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    const response = await axios.get<CartResponse>('/carts', {
      headers: {
        'X-Auth-UserId': userId,
      },
    });
    console.log('Fetched cart items:', response.data);
    const updatedItems = response.data.items.map((item) => ({
      ...item,
      color: item.color ?? null, // Normalize null color
      type: item.type || 'phone', // Default type
      productName: undefined, // Ensure productName is undefined
    }));
    useCartStore.getState().setItems(updatedItems);
    return updatedItems;
  } catch (error: any) {
    console.error('Failed to fetch cart items:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart items');
  }
};

export const updateCartItem = async (userId: string, item: CartItem): Promise<void> => {
  try {
    const { productId, quantity, color } = item;
    const response = await axios.put('/carts/items', { productId, quantity, color }, {
      headers: {
        'X-Auth-UserId': userId,
      },
    });
    console.log('Updated cart item:', response.data);
    useCartStore.getState().updateQuantity(item.productId, item.color, item.quantity);
  } catch (error: any) {
    console.error('Failed to update cart item:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
};

export const removeItemFromCart = async (userId: string, productId: string, color: string): Promise<void> => {
  try {
    const response = await axios.delete(`/carts/items/${productId}/${color}`, {
      headers: {
        'X-Auth-UserId': userId,
      },
    });
    console.log('Removed cart item:', response.data);
    useCartStore.getState().removeItem(productId, color);
  } catch (error: any) {
    console.error('Failed to remove cart item:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to remove cart item');
  }
};

export const clearCart = async (userId: string): Promise<void> => {
  try {
    const response = await axios.delete('/carts', {
      headers: {
        'X-Auth-UserId': userId,
      },
    });
    console.log('Cleared cart:', response.data);
    useCartStore.getState().clearCart();
  } catch (error: any) {
    console.error('Failed to clear cart:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};

export const mergeCart = async (userId: string): Promise<void> => {
  try {
    const guestCartItems = useCartStore.getState().items.map((item: CartItem) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color,
    }));
    console.log('Merging cart for user:', userId, 'Items:', guestCartItems);
    const response = await axios.post<CartResponse>('/carts/merge', guestCartItems, {
      headers: {
        'X-Auth-UserId': userId,
      },
    });
    console.log('Cart merge successful:', response.data);
    const updatedItems = response.data.items.map((serverItem) => {
      const guestItem = useCartStore.getState().items.find(
        (i) => i.productId === serverItem.productId && i.color === serverItem.color
      );
      return {
        ...serverItem,
        color: serverItem.color ?? null, // Normalize null color
        type: guestItem?.type || 'phone', // Preserve or default
        productName: undefined, // Ensure undefined
      };
    });
    useCartStore.getState().setItems(updatedItems);
  } catch (error: any) {
    console.error('Cart merge failed:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Cart merge failed');
  }
};