import axios from '../config/axios';
import { CartItem, CartResponse, CheckoutPayload } from '../types/cart';
import { useCartStore } from '../store/cartStore';

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
      let guestId = localStorage.getItem('guestCartId');
      if (!guestId) {
        const response = await axios.post<CartResponse>('/guest-carts');
        guestId = response.data.userId;
        localStorage.setItem('guestCartId', guestId);
        console.log('Created new guest cart:', guestId);
      }

      const response = await axios.post<CartResponse>(`/guest-carts/${guestId}/items`, { productId, quantity, color: apiColor });
      console.log('Added item to guest cart:', response.data);
      useCartStore.getState().setItems(response.data.items.map((item) => ({
        ...item,
        color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
      })));
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
    console.error('Failed to add item to cart:', errorMessage, 'Status:', error.response?.status);
    throw new Error(errorMessage);
  }
};

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  try {
    let response: { data: CartResponse };
    if (userId.startsWith('guest-')) {
      response = await axios.get<CartResponse>(`/guest-carts/${userId}`);
    } else {
      console.log('Fetching cart for user:', userId);
      response = await axios.get<CartResponse>('/carts', {
        headers: {
          'X-Auth-UserId': userId,
        },
      });
    }
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
      const guestId = localStorage.getItem('guestCartId');
      if (!guestId) {
        throw new Error('No guest cart found');
      }
      const response = await axios.put(`/guest-carts/${guestId}/items/${productId}`, {}, {
        params: {
          quantity,
          color: apiColor,
        },
      });
      console.log('Updated guest cart item:', response.data);
      useCartStore.getState().setItems(response.data.items.map((item) => ({
        ...item,
        color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
      })));
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
      const guestId = localStorage.getItem('guestCartId');
      if (!guestId) {
        throw new Error('No guest cart found');
      }
      const response = await axios.delete(`/guest-carts/${guestId}/items/${productId}`, {
        params: {
          color: apiColor,
        },
      });
      console.log('Removed guest cart item:', response.data);
      useCartStore.getState().setItems(response.data.items.map((item) => ({
        ...item,
        color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
      })));
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
      const guestId = localStorage.getItem('guestCartId');
      if (!guestId) {
        console.log('No guest cart to clear');
        useCartStore.getState().clearCart();
        return;
      }
      await axios.delete(`/guest-carts/${guestId}`);
      console.log('Cleared guest cart:', guestId);
      localStorage.removeItem('guestCartId');
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
    const guestId = localStorage.getItem('guestCartId');
    if (!guestId) {
      console.log('No guest cart to merge');
      await getCartItems(userId);
      return;
    }

    console.log('Merging guest cart for user:', userId, 'Guest ID:', guestId);
    const response = await axios.post<CartResponse>(
      '/carts/merge-guest',
      {},
      {
        headers: {
          'X-Auth-UserId': userId,
        },
        params: {
          guestId,
        },
      }
    );
    console.log('Cart merge successful:', response.data);
    const updatedItems = response.data.items.map((item) => ({
      ...item,
      color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
    }));
    useCartStore.getState().setItems(updatedItems);
    localStorage.removeItem('guestCartId');
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Cart merge failed';
    console.error('Cart merge failed:', errorMessage);
    await getCartItems(userId);
    localStorage.removeItem('guestCartId');
    throw new Error(errorMessage);
  }
};

export const checkout = async (payload: CheckoutPayload): Promise<void> => {
  try {
    console.log('Sending checkout request:', payload);
    await axios.post('/carts/checkout', payload);
    console.log('Checkout successful');
    useCartStore.getState().clearCart();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Checkout failed';
    console.error('Checkout failed:', errorMessage);
    throw new Error(errorMessage);
  }
};