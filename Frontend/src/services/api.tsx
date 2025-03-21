import axios from 'axios';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://api.yourdomain.com';

// Hàm tiện ích để xử lý việc refresh token khi cần
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Nếu lỗi 401 và chưa thử refresh token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const auth = useAuth();
          await auth.refreshToken();
          
          return axios(originalRequest);
        } catch (refreshError) {
          // Nếu refresh token thất bại, chuyển đến trang đăng nhập
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// API cho sản phẩm
export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },
  
  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await axios.post(`${API_URL}/products`, product);
    return response.data;
  },
  
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await axios.put(`${API_URL}/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/products/${id}`);
  }
};