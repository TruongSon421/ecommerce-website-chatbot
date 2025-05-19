export interface User {
  id: string;
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