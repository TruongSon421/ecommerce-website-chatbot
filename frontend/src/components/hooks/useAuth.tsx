import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, register, logout } from '../../store/slices/authSlices';
import { LoginCredentials, RegisterCredentials, User } from '../../types/auth';
import { useCallback, useEffect } from 'react';
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
  const { user, accessToken, loading, error } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!user && !!accessToken;
  const isAdmin = user?.roles?.includes('ADMIN') || false;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.username) {
          console.log('Loaded user from localStorage:', parsedUser);
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
          getCartItems(parsedUser.id).catch((err: unknown) =>
            console.error('Failed to fetch cart on init:', err)
          );
        } else {
          throw new Error('Invalid user data');
        }
      } catch (err: unknown) {
        console.error('Failed to parse user from localStorage:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }, [dispatch]);

  const loginHandler = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await dispatch(login(credentials)).unwrap();
      if (result.user && result.user.id && result.accessToken) {
        console.log('Login successful, saving accessToken:', result.accessToken);
        localStorage.setItem('accessToken', result.accessToken);
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
      console.log('Cleared cart for new guest session on logout');
    } catch (err: unknown) {
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