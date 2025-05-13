import axios from '../config/axios';
import { CartItem, CartResponse } from '../types/cart';
import { useCartStore } from '../store/cartStore';
import { deleteCookie } from '../components/utils/cookie';

export const addItemToCart = async (userId: string, item: CartItem, isAuthenticated: boolean): Promise<void> => {
  try {
    const { productId, quantity, color } = item;
    const apiColor = color === 'Không xác định' ? 'default' : color;
    console.log('Adding item to cart for user:', userId, 'Item:', { productId, quantity, color: apiColor });
    if (isAuthenticated) {
      const response = await axios.post<CartResponse>('/carts/items', { productId, quantity, color: apiColor }, {
        headers: {
          'X-Auth-UserId': userId,
        },
      });
      console.log('Added item to cart:', response.data);
      await getCartItems(userId);
    } else {
      const currentCartItems = useCartStore.getState().items;
      const existingItem = currentCartItems.find(
        (cartItem) => cartItem.productId === productId && cartItem.color === color
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        console.log('Item exists, updating quantity locally:', { productId, color, newQuantity });
        useCartStore.getState().updateQuantity(productId, color, newQuantity);
      } else {
        useCartStore.getState().addItem({
          ...item,
          color: color === 'default' || !color ? 'Không xác định' : color,
        });
      }
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
    console.error('Failed to add item to cart:', errorMessage, 'Status:', error.response?.status);
    throw new Error(errorMessage);
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
      color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
    }));
    useCartStore.getState().setItems(updatedItems);
    return updatedItems;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch cart items';
    console.error('Failed to fetch cart items:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateCartItem = async (userId: string, item: CartItem, isAuthenticated: boolean): Promise<void> => {
  try {
    const { productId, quantity, color } = item;
    const apiColor = color === 'Không xác định' ? 'default' : color;
    if (isAuthenticated) {
      const response = await axios.put(`/carts/items/${productId}`, {}, {
        headers: {
          'X-Auth-UserId': userId,
        },
        params: {
          quantity,
          color: apiColor,
        },
      });
      console.log('Updated cart item:', response.data);
      await getCartItems(userId);
    } else {
      useCartStore.getState().updateQuantity(productId, color, quantity);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
    console.error('Failed to update cart item:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const removeItemFromCart = async (userId: string, productId: string, color: string, isAuthenticated: boolean): Promise<void> => {
  try {
    const apiColor = color === 'Không xác định' ? 'default' : color;
    console.log('Deleting item:', { productId, color: apiColor, isAuthenticated });
    if (isAuthenticated) {
      const response = await axios.delete(`/carts/items/${productId}`, {
        headers: {
          'X-Auth-UserId': userId,
        },
        params: {
          color: apiColor,
        },
      });
      console.log('Removed cart item:', response.data);
      await getCartItems(userId);
    } else {
      useCartStore.getState().removeItem(productId, color);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to remove cart item';
    console.error('Failed to remove cart item:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const clearCart = async (userId: string, isAuthenticated: boolean): Promise<void> => {
  try {
    if (isAuthenticated) {
      const response = await axios.delete('/carts', {
        headers: {
          'X-Auth-UserId': userId,
        },
      });
      console.log('Cleared cart:', response.data);
      await getCartItems(userId);
    } else {
      useCartStore.getState().clearCart();
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
    console.error('Failed to clear cart:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const mergeCart = async (userId: string): Promise<void> => {
  try {
    const guestCartItems = useCartStore.getState().items.map((item: CartItem) => ({
      productId: item.productId,
      quantity: item.quantity,
      color: item.color === 'Không xác định' ? 'default' : item.color,
    }));
    console.log('Merging cart for user:', userId, 'Items:', guestCartItems);

    if (guestCartItems.length > 0) {
      const response = await axios.post<CartResponse>('/carts/merge', guestCartItems, {
        headers: {
          'X-Auth-UserId': userId,
        },
      });
      console.log('Cart merge successful:', response.data);
      const updatedItems = response.data.items.map((item) => ({
        ...item,
        color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
      }));
      useCartStore.getState().setItems(updatedItems);
    } else {
      console.log('Guest cart is empty, skipping merge');
      await getCartItems(userId);
    }

    // Clear guest cart cookies
    deleteCookie('guest_cart');
    deleteCookie('session_id');
    useCartStore.getState().clearCart();
    console.log('Guest cart cookies and store cleared after merge');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Cart merge failed';
    console.error('Cart merge failed:', errorMessage);
    await getCartItems(userId);
    // Still clear guest cart cookies on failure to avoid stale data
    deleteCookie('guest_cart');
    deleteCookie('session_id');
    useCartStore.getState().clearCart();
    console.log('Guest cart cookies and store cleared despite merge failure');
    throw new Error(errorMessage);
  }
};