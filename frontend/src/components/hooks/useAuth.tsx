import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, register, logout } from '../../store/slices/authSlices';
import { LoginCredentials, RegisterCredentials, User } from '../../types/auth';
import { mergeCart, getCartItems } from '../../services/cartService';
import { useCartStore } from '../../store/cartStore';

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
  const { user, accessToken, loading: reduxLoading, error } = useSelector((state: RootState) => state.auth);
  const [initialLoading, setInitialLoading] = useState(true);

  // Synchronously check localStorage for initial state
  let initialUser: User | null = null;
  let initialAccessToken: string | null = null;
  let initialRefreshToken: string | null = null;

  try {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedUser !== 'undefined') {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.username) {
        initialUser = parsedUser;
        initialAccessToken = storedAccessToken;
        initialRefreshToken = storedRefreshToken || null;
      }
    }
  } catch (err) {
    console.error('Failed to parse user from localStorage:', err);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Use initial state if available, otherwise fall back to Redux
  const currentUser = user || initialUser;
  const currentAccessToken = accessToken || initialAccessToken;
  const isAuthenticated = !!currentUser && !!currentAccessToken;
  const isAdmin = currentUser?.roles?.includes('ADMIN') || false;

  useEffect(() => {
    if (initialUser && initialAccessToken && !user) {
      dispatch(
        login.fulfilled(
          {
            user: initialUser,
            accessToken: initialAccessToken,
            refreshToken: initialRefreshToken,
          },
          'auth/login',
          { username: '', password: '' }
        )
      );
      getCartItems(initialUser.id).catch((err: unknown) =>
        console.error('Failed to fetch cart on init:', err)
      );
    }
    setInitialLoading(false);
  }, [dispatch, initialUser, initialAccessToken, initialRefreshToken, user]);

  const loginHandler = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      if (result.user && result.user.id && result.accessToken) {
        console.log('Login successful, saving accessToken:', result.accessToken);
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('refreshToken', result.refreshToken || '');
        await mergeCart(result.user.id);
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
      throw err;
    }
  }, [dispatch]);

  const registerHandler = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const result = await dispatch(register(credentials)).unwrap();
      if (result.user && result.user.id && result.accessToken) {
        console.log('Register successful, saving accessToken:', result.accessToken);
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('refreshToken', result.refreshToken || '');
        await mergeCart(result.user.id);
      }
    } catch (err: unknown) {
      console.error('Register failed:', err);
      throw err;
    }
  }, [dispatch]);

  const logoutHandler = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      useCartStore.getState().clearCart();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('Cleared cart and localStorage on logout');
    } catch (err: unknown) {
      console.error('Logout failed:', err);
      throw err;
    }
  }, [dispatch]);

  return {
    user: currentUser,
    accessToken: currentAccessToken,
    loading: reduxLoading || initialLoading,
    error,
    isAuthenticated,
    isAdmin,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
  };
};
