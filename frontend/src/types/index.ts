export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'phone' | 'laptop' | 'audio' | 'accessory';
    subCategory?: string; // Cho phụ kiện: cáp, sạc, hub, chuột, bàn phím
    imageUrl: string;
    stock: number;
    createdAt: string;
    updatedAt: string;
  }

// Export other types
export * from './auth';
export * from './cart';
export * from './product';
export * from './datafilter';
export * from './group';
export * from './review';
export * from './order';
  