import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';
import { LoginCredentials, RegisterCredentials, User, AuthResponse } from '../../types/auth';
import { initializeGuestCart } from '../../services/cartService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/login', credentials);
      const { token, refreshToken, id, username, email, roles } = response.data;
      if (!id || !username) {
        throw new Error('Invalid user data from server');
      }
      const user: User = {
        id: id.toString(),
        username,
        email,
        roles: roles.map((role) => role.replace('ROLE_', '')),
      };
      console.log('Saving to localStorage:', { user, accessToken: token, refreshToken });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      return { user, accessToken: token, refreshToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('Login error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/register', credentials);
      const { token, refreshToken, id, username, email, roles } = response.data;
      if (!id || !username) {
        throw new Error('Invalid user data from server');
      }
      const user: User = {
        id: id.toString(),
        username,
        email,
        roles: roles.map((role) => role.replace('ROLE_', '')),
      };
      console.log('Saving to localStorage:', { user, accessToken: token, refreshToken });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      return { user, accessToken: token, refreshToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Register failed';
      console.error('Register error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      await initializeGuestCart();
      return {};
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Logout failed';
      console.error('Logout error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export default authSlice.reducer;