export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  addresses: Address[];
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
