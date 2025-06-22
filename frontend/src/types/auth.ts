export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  addresses?: Address[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export interface Address {
  id?: number;
  province: string;
  district: string;
  ward: string;
  street: string;
  addressType?: string;
  receiverName: string;
  receiverPhone: string;
  isDefault?: boolean;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roleNames?: string[];
  addresses?: Address[];
}

// New interface for auth API response user data
export interface AuthUserResponse {
  id: number;
  username: string;
  email: string;
  role: string; // ROLE_USER, ROLE_ADMIN, etc.
}

// Detailed user profile interface (for profile API)
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean | null;
  role: string;
  addresses: Address[];
}
