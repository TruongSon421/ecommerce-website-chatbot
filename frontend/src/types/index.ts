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
  