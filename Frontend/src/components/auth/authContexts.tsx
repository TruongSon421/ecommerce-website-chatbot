import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api from '../api/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));

  // Đồng bộ trạng thái khi reload
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else if (!storedToken) {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data: AuthResponse = response.data;

      const userData: User = {
        id: data.id.toString(),
        username: data.username,
        email: data.email,
        role: data.roles.includes('ROLE_ADMIN') ? 'admin' : 'user',
      };

      setUser(userData);
      setAccessToken(data.token);
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const registerData = {
        username: credentials.username,
        password: credentials.password,
        email: credentials.email,
      };

      const response = await api.post('/auth/register', registerData);
      const data: AuthResponse = response.data;

      const userData: User = {
        id: data.id.toString(),
        username: data.username,
        email: data.email,
        role: data.roles.includes('ROLE_ADMIN') ? 'admin' : 'user',
      };

      setUser(userData);
      setAccessToken(data.token);
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/api/logout', { accessToken, refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};