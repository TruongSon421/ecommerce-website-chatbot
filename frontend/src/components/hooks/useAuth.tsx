import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, register, logout } from '../../store/slices/authSlices'; 
import { LoginCredentials, RegisterCredentials, User } from '../../types/auth';
import { useCallback } from 'react';

interface UseAuth {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuth => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, loading, error } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!user && !!accessToken;
  const isAdmin = user && user.role === 'admin' || false;

  const loginHandler = useCallback(async (credentials: LoginCredentials) => {
    try {
      await dispatch(login(credentials)).unwrap();
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  }, [dispatch]);

  const registerHandler = useCallback(async (credentials: RegisterCredentials) => {
    try {
      await dispatch(register(credentials)).unwrap();
    } catch (err) {
      console.error('Register failed:', err);
      throw err;
    }
  }, [dispatch]);

  const logoutHandler = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  }, [dispatch]);

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
  };
};