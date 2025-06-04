import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8070/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm Authorization header
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('Added Authorization header:', config.headers.Authorization);
    } else {
      console.log('No accessToken found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 và làm mới token
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        console.log('Attempting to refresh token with:', refreshToken);
        const response = await axios.post('http://localhost:8070/api/auth/refresh-token', {
          refreshToken,
        });
        const { token, refreshToken: newRefreshToken } = response.data;
        console.log('Refresh token successful:', { token, newRefreshToken });
        localStorage.setItem('accessToken', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    console.error('Response error:', error.response?.data);
    return Promise.reject(error);
  }
);

export default instance;
