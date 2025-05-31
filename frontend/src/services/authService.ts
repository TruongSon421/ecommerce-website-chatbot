import axios from '../config/axios';
import { mergeCart } from './cartService';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';
import { initializeGuestCart } from './cartService';

const API_URL = 'http://localhost:8070/api/auth';


export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { token: accessToken, refreshToken, id, username, email, roles } = response.data;
    if (!id || !accessToken || !username || !email || !roles) {
      throw new Error('Invalid login response');
    }
    const user: User = { id: String(id), username, email, roles };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
    localStorage.setItem('user', JSON.stringify(user));

    if (user.id) {
      try {
        await mergeCart(user.id);
        localStorage.removeItem('guestCartId');
      } catch (cartError) {
        console.warn('Failed to merge cart, continuing login:', cartError);
      }
    }

    return { user, accessToken, refreshToken };
  } catch (error: any) {
    console.error('Login failed:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (credentials: RegisterCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/register`, credentials);
    const { token: accessToken, refreshToken, id, username, email, roles } = response.data;
    if (!id || !accessToken || !username || !email || !roles) {
      throw new Error('Invalid register response');
    }
    const user: User = { id: String(id), username, email, roles };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
    localStorage.setItem('user', JSON.stringify(user));

    // Merge local cart with server cart after register
    if (user.id) {
      try {
        await mergeCart(user.id);
        localStorage.removeItem('guestCartId');
      } catch (cartError) {
        console.warn('Failed to merge cart, continuing register:', cartError);
        // Continue register even if cart merge fails
      }
    }

    return { user, accessToken, refreshToken };
  } catch (error: any) {
    console.error('Register failed:', error);
    throw new Error(error.response?.data?.message || 'Register failed');
  }
};

export const adminLogin = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, credentials);
    const { token: accessToken, refreshToken, id, username, email, roles } = response.data;
    if (!id || !accessToken || !username || !email || !roles) {
      throw new Error('Invalid admin login response');
    }
    const user: User = { id: String(id), username, email, roles };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
    localStorage.setItem('user', JSON.stringify(user));

    // Merge local cart with server cart after admin login
    if (user.id) {
      try {
        localStorage.removeItem('guestCartId');
      } catch (cartError) {
        console.warn('Failed to merge cart, continuing admin login:', cartError);
        // Continue admin login even if cart merge fails
      }
    }

    return { user, accessToken, refreshToken };
  } catch (error: any) {
    console.error('Admin login failed:', error);
    throw new Error(error.response?.data?.message || 'Admin login failed');
  }
};

export const adminRegister = async (credentials: RegisterCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/admin/register`, credentials);
    const { token: accessToken, refreshToken, id, username, email, roles } = response.data;
    if (!id || !accessToken || !username || !email || !roles) {
      throw new Error('Invalid admin register response');
    }
    const user: User = { id: String(id), username, email, roles };
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
    localStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  } catch (error: any) {
    console.error('Admin register failed:', error);
    throw new Error(error.response?.data?.message || 'Admin register failed');
  }
};

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {
      refreshToken: localStorage.getItem('refreshToken'),
    });
  } catch (error: any) {
    console.error('Logout failed:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    await initializeGuestCart();
  }
};
