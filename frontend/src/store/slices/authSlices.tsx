import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterCredentials } from '../../types/auth';
import { loginService, registerService, logoutService, validateTokenService, refreshTokenService } from '../../services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: localStorage.getItem('accessToken') ? true : false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    const data = await loginService(credentials);
    const userData: User = {
      id: data.id.toString(),
      username: data.username,
      email: data.email,
      role: data.roles.includes('ROLE_ADMIN') ? 'admin' : 'user',
    };
    return { user: userData, accessToken: data.token, refreshToken: data.refreshToken };
  } catch (error: any) {
    // Xử lý lỗi từ server response
    if (error.response?.data?.message) {
      return rejectWithValue(error.response.data.message);
    } else if (error.response?.data?.error) {
      return rejectWithValue(error.response.data.error);
    } else if (error.message) {
      return rejectWithValue(error.message);
    } else {
      return rejectWithValue('Login failed');
    }
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Step 1: Register user
      const registerResponse = await registerService({
        username: credentials.username,
        password: credentials.password,
        email: credentials.email,
      });
      
      // Step 2: Auto login after successful registration
      const loginData = await loginService({
        username: credentials.username,
        password: credentials.password,
      });
      
      const userData: User = {
        id: loginData.id.toString(),
        username: loginData.username,
        email: loginData.email,
        role: loginData.roles.includes('ROLE_ADMIN') ? 'admin' : 'user',
      };
      
      return { user: userData, accessToken: loginData.token, refreshToken: loginData.refreshToken };
      
    } catch (error: any) {
      // Xử lý lỗi từ server response
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      } else if (error.message) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue('Registration failed');
      }
    }
  }
);

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.accessToken) return false;
    
    try {
      await validateTokenService(state.auth.accessToken);
      return true;
    } catch (error) {
      await dispatch(refreshToken());
      return false;
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    try {
      const response = await refreshTokenService(state.auth.refreshToken!);
      return response;
    } catch (error: any) {
      return rejectWithValue('Failed to refresh token');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as { auth: AuthState };
  await logoutService(state.auth.refreshToken);
  return null;
});

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
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
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
        state.isAuthenticated = true;
        state.error = null;
        
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.clear();
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});

export default authSlice.reducer;