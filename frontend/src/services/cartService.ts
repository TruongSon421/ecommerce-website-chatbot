import axios from '../config/axios';
import { CartItem, CartResponse, CheckoutPayload, CheckoutResponse, PaymentUrlResponse, PaymentStatusResponse } from '../types/cart';
import { useCartStore } from '../store/cartStore';

// Guest cart management functions
export const getGuestId = (): string | null => {
  return localStorage.getItem('guestId');
};

export const setGuestId = (guestId: string): void => {
  localStorage.setItem('guestId', guestId);
};

export const removeGuestId = (): void => {
  localStorage.removeItem('guestId');
};

export const createGuestCart = async (): Promise<CartResponse> => {
  try {
    console.log('Creating new guest cart');
    const response = await axios.post<CartResponse>('/guest-carts');
    console.log('Created guest cart:', response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create guest cart';
    console.error('Failed to create guest cart:', errorMessage);
    throw new Error(errorMessage);
  }
};

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
      // For guest users, use guestId-based API
      const guestId = getGuestId();
      if (!guestId) {
        throw new Error('Guest ID not found. Please refresh the page.');
      }
      const response = await axios.post<CartResponse>(`/guest-carts/${guestId}/items`, { productId, quantity, color: apiColor });
      console.log('Added item to guest cart:', response.data);
      useCartStore.getState().setItems(response.data.items.map((item: CartItem) => ({
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
      // For guest users, use guestId-based API
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
    const updatedItems = response.data.items.map((item: CartItem) => ({
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
      // For guest users, use guestId-based API
      const guestId = getGuestId();
      if (!guestId) {
        throw new Error('Guest ID not found. Please refresh the page.');
      }
      const response = await axios.put(`/guest-carts/${guestId}/items/${productId}`, {}, {
        params: {
          quantity,
          color: apiColor,
        },
      });
      console.log('Updated guest cart item:', response.data);
      useCartStore.getState().setItems(response.data.items.map((item: CartItem) => ({
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
      // For guest users, use guestId-based API
      const guestId = getGuestId();
      if (!guestId) {
        throw new Error('Guest ID not found. Please refresh the page.');
      }
      const response = await axios.delete(`/guest-carts/${guestId}/items/${productId}`, {
        params: {
          color: apiColor,
        },
      });
      console.log('Removed guest cart item:', response.data);
      useCartStore.getState().setItems(response.data.items.map((item: CartItem) => ({
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
      // For guest users, use guestId-based API
      const guestId = getGuestId();
      if (!guestId) {
        throw new Error('Guest ID not found. Please refresh the page.');
      }
      await axios.delete(`/guest-carts/${guestId}`);
      console.log('Cleared guest cart');
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
    const guestId = getGuestId();
    if (!guestId) {
      console.log('No guest cart to merge');
      return;
    }
    
    console.log('Merging guest cart for user:', userId, 'guestId:', guestId);
    const response = await axios.post<CartResponse>(
      '/carts/merge-guest',
      {},
      {
        headers: {
          'X-Auth-UserId': userId,
        },
        params: {
          guestId: guestId,
        },
      }
    );
    console.log('Cart merge successful:', response.data);
    const updatedItems = response.data.items.map((item: CartItem) => ({
      ...item,
      color: item.color === 'default' || !item.color ? 'Không xác định' : item.color,
    }));
    useCartStore.getState().setItems(updatedItems);
    
    // Remove guest ID after successful merge
    removeGuestId();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Cart merge failed';
    console.error('Cart merge failed:', errorMessage);
    await getCartItems(userId);
    throw new Error(errorMessage);
  }
};

export const checkout = async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
  try {
    console.log('Sending checkout request:', payload);
    const response = await axios.post<CheckoutResponse>('/carts/checkout', payload);
    console.log('Checkout successful:', response.data);
    useCartStore.getState().clearCart();
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Checkout failed';
    console.error('Checkout failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Get payment URL using transaction ID
export const getPaymentUrl = async (transactionId: string): Promise<PaymentUrlResponse> => {
  try {
    console.log('Getting payment URL for transaction:', transactionId);
    const response = await axios.post<PaymentUrlResponse>(`/payments/url/${transactionId}`);
    console.log('Payment URL response:', response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to get payment URL';
    console.error('Failed to get payment URL:', errorMessage);
    throw new Error(errorMessage);
  }
};

// Check payment status
export const checkPaymentStatus = async (transactionId: string): Promise<PaymentStatusResponse> => {
  try {
    console.log('Checking payment status for transaction:', transactionId);
    const response = await axios.get<PaymentStatusResponse>(`/payments/status/${transactionId}`);
    console.log('Payment status response:', response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to check payment status';
    console.error('Failed to check payment status:', errorMessage);
    throw new Error(errorMessage);
  }
};