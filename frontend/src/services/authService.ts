import api from '../config/axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export const loginService = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerService = async (
  credentials: Omit<RegisterCredentials, 'confirmPassword'>
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const logoutService = async (refreshToken: string | null): Promise<void> => {
  await api.post('/auth/logout', { refreshToken });
};

export const validateTokenService = async (token: string) => {
  const response = await api.post('/auth/validate-token', { token });
  return response.data;
};

export const refreshTokenService = async (refreshToken: string) => {
  const response = await api.post('/auth/refresh-token', { refreshToken });
  return response.data;
};
