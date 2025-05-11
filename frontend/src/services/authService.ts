import axios from '../config/axios';
import { mergeCart } from './cartService';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

const API_URL = 'http://localhost:8070/api/auth';
const USER_API_URL = 'http://localhost:8070/api/users';

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
        localStorage.removeItem('cart-storage');
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
        await mergeCart(user.id);
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

    // Merge local cart with server cart after admin register
    if (user.id) {
      try {
        await mergeCart(user.id);
      } catch (cartError) {
        console.warn('Failed to merge cart, continuing admin register:', cartError);
        // Continue admin register even if cart merge fails
      }
    }

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
  }
};

export const getProfile = async (): Promise<User> => {
  try {
    const response = await axios.get(`${USER_API_URL}/profile`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

export const updateProfile = async (profile: Partial<User>): Promise<void> => {
  try {
    await axios.put(`${USER_API_URL}/profile`, profile);
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};