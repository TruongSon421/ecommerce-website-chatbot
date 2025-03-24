import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { login, register, logout } from '../../store/slices/authSlices';
import { LoginCredentials, RegisterCredentials, User } from '../../types/auth';

// Định nghĩa interface cho giá trị trả về của hook
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

  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  const isAuthenticated = !!user && !!accessToken;

  // Kiểm tra xem người dùng có phải admin hay không
  const isAdmin = user?.role === 'admin';

  // Hàm login
  const loginHandler = async (credentials: LoginCredentials) => {
    await dispatch(login(credentials)).unwrap(); // unwrap để xử lý lỗi trực tiếp nếu cần
  };

  // Hàm register
  const registerHandler = async (credentials: RegisterCredentials) => {
    await dispatch(register(credentials)).unwrap();
  };

  // Hàm logout
  const logoutHandler = async () => {
    await dispatch(logout()).unwrap();
  };

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