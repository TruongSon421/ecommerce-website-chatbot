import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import api from '../api/api';

interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin';
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
  admin: Admin | null;
  accessAdminToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthAdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const storedUser = localStorage.getItem('admin');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [accessAdminToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessAdminToken'));

  // Đồng bộ trạng thái khi reload
  useEffect(() => {
    const storedUser = localStorage.getItem('admin');
    const storedToken = localStorage.getItem('accessAdminToken');

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setAdmin(JSON.parse(storedUser));
    } else if (!storedToken) {
      setAdmin(null);
      setAccessToken(null);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data: AuthResponse = response.data;

      const userData: Admin = {
        id: data.id.toString(),
        username: data.username,
        email: data.email,
        role: 'admin',
      };

      setAdmin(userData);
      setAccessToken(data.token);
      localStorage.setItem('accessAdminToken', data.token);
      localStorage.setItem('refreshAdminToken', data.refreshToken);
      localStorage.setItem('admin', JSON.stringify(userData));
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

      const response = await api.post('/auth/users', registerData);
      const data: AuthResponse = response.data;

      const userData: Admin = {
        id: data.id.toString(),
        username: data.username,
        email: data.email,
        role: 'admin',
      };

      setAdmin(userData);
      setAccessToken(data.token);
      localStorage.setItem('accessAdminToken', data.token);
      localStorage.setItem('refreshAdminToken', data.refreshToken);
      localStorage.setItem('admin', JSON.stringify(userData));
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshAdminToken');
      await api.post('/api/logout', { accessAdminToken, refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAdmin(null);
    setAccessToken(null);
    localStorage.removeItem('accessAdminToken');
    localStorage.removeItem('refreshAdminToken');
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ admin , accessAdminToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};