import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, register, logout } from '../../store/slices/authSlices'; 
import { LoginCredentials, RegisterCredentials, User } from '../../types/auth';
import { useCallback } from 'react';
import { mergeCart } from '../../services/cartService';

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
  const { user, accessToken, loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Fallback calculation if isAuthenticated is not properly set
  const calculatedIsAuthenticated = isAuthenticated || (!!user && !!accessToken);
  const isAdmin = user && user.role === 'admin' || false;

  const loginHandler = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      
      // After successful login, merge guest cart with user cart (except for admin users)
      if (result.user?.id && result.user?.role !== 'admin') {
        try {
          await mergeCart(result.user.id);
          console.log('Cart merged successfully after login');
        } catch (mergeError) {
          console.error('Failed to merge cart after login:', mergeError);
          // Don't throw error here as login was successful
        }
      } else if (result.user?.role === 'admin') {
        console.log('Admin user detected, skipping cart merge');
      }
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  }, [dispatch]);

  const registerHandler = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const result = await dispatch(register(credentials)).unwrap();
      
      // After successful registration, merge guest cart with user cart (except for admin users)
      if (result.user?.id && result.user?.role !== 'admin') {
        try {
          await mergeCart(result.user.id);
          console.log('Cart merged successfully after registration');
        } catch (mergeError) {
          console.error('Failed to merge cart after registration:', mergeError);
          // Don't throw error here as registration was successful
        }
      } else if (result.user?.role === 'admin') {
        console.log('Admin user detected, skipping cart merge');
      }
    } catch (err) {
      console.error('Register failed:', err);
      throw err;
    }
  }, [dispatch]);

  const logoutHandler = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      // Clear cart store on logout - guest cart will be re-initialized if needed
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
    isAuthenticated: calculatedIsAuthenticated,
    isAdmin,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
  };
};