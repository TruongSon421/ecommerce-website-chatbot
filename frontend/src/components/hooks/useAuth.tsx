import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, register, logout } from '../../store/slices/authSlices';
import { LoginCredentials, RegisterCredentials, User } from '../../types/auth';
import { useCallback, useEffect } from 'react';

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
  const isAdmin = user?.roles?.includes('ADMIN') || false;

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          dispatch(
            login.fulfilled(
              {
                user: parsedUser,
                accessToken: storedAccessToken,
                refreshToken: storedRefreshToken || null,
              },
              'auth/login',
              { username: '', password: '' }
            )
          );
        } else {
          throw new Error('Invalid user data');
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
        // Clear invalid localStorage to prevent repeated errors
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, [dispatch]);

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