import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://api.yourdomain.com';

export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const hasAdminRole = (user: { roles: string[] } | null): boolean => {
  return user?.roles.includes('ROLE_ADMIN') || false;
};
