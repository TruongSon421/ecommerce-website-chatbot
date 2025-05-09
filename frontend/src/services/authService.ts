import axios from '../config/axios';
import { mergeCart } from './cartService';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

const API_URL = 'http://localhost:8070/api/auth';

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { token: accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    // Merge local cart with server cart after login
    if (user?.id) {
      await mergeCart(user.id);
    }

    return { user, accessToken };
  } catch (error: any) {
    console.error('Login failed:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const register = async (credentials: RegisterCredentials) => {
  try {
    const response = await axios.post(`${API_URL}/register`, credentials);
    const { token: accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    return { user, accessToken };
  } catch (error: any) {
    console.error('Register failed:', error);
    throw new Error(error.response?.data?.message || 'Register failed');
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  } catch (error: any) {
    console.error('Logout failed:', error);
    throw new Error('Logout failed');
  }
};