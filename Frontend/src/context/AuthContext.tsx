// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';
import { setAuthToken, isTokenExpired, refreshAccessToken } from '../utils/auth';

interface AuthContextType {
  authState: AuthState;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

enum ActionType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGOUT = 'LOGOUT',
  AUTH_ERROR = 'AUTH_ERROR',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  SET_LOADING = 'SET_LOADING'
}

interface AuthAction {
  type: ActionType;
  payload?: any;
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case ActionType.LOGIN_SUCCESS:
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case ActionType.REFRESH_TOKEN:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        error: null
      };
    case ActionType.AUTH_ERROR:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case ActionType.LOGOUT:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        dispatch({ type: ActionType.SET_LOADING, payload: false });
        return;
      }
      
      if (isTokenExpired(accessToken)) {
        try {
          if (refreshToken && !isTokenExpired(refreshToken)) {
            await refreshTokenAction();
          } else {
            logoutAction();
          }
        } catch (error) {
          logoutAction();
        }
      } else {
        try {
          // Lấy thông tin user từ token hoặc gọi API để lấy
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          dispatch({
            type: ActionType.LOGIN_SUCCESS,
            payload: { user, accessToken, refreshToken, isAuthenticated: true }
          });
          setAuthToken(accessToken);
        } catch (error) {
          logoutAction();
        }
      }
    };

    initAuth();
  }, []);

  const loginAction = (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setAuthToken(accessToken);
    
    dispatch({
      type: ActionType.LOGIN_SUCCESS,
      payload: { accessToken, refreshToken, user }
    });
  };

  const logoutAction = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setAuthToken(null);
    
    dispatch({ type: ActionType.LOGOUT });
  };

  const refreshTokenAction = async () => {
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    
    try {
      const refreshTokenValue = authState.refreshToken;
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const response = await refreshAccessToken(refreshTokenValue);
      const { accessToken, refreshToken: newRefreshToken } = response;
      
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      setAuthToken(accessToken);
      
      dispatch({
        type: ActionType.REFRESH_TOKEN,
        payload: { 
          accessToken, 
          refreshToken: newRefreshToken || refreshTokenValue
        }
      });
      
      return accessToken;
    } catch (error) {
      dispatch({ 
        type: ActionType.AUTH_ERROR, 
        payload: 'Failed to refresh token' 
      });
      logoutAction();
      throw error;
    } finally {
      dispatch({ type: ActionType.SET_LOADING, payload: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login: loginAction,
        logout: logoutAction,
        refreshToken: refreshTokenAction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};