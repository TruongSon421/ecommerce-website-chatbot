export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
  }
  
  export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'phone' | 'laptop' | 'tablet' | 'audio' | 'accessory';
    subCategory?: string; // Cho phụ kiện: cáp, sạc, hub, chuột, bàn phím
    imageUrl: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
  }
  