// src/types/product.ts
export interface InventoryRequest {
    color: string | null;
    quantity: number;
    originalPrice: string | null;
    currentPrice: string | null;
}
  
export interface ProductRequest {
    productName: string;
    description: string;
    brand: string;
    category: string;
    images: string[];
    colors: string[];
    variant: string;
    type: string;
}
  
export interface ProductCreateRequest {
    productRequest: ProductRequest;
    inventoryRequests: InventoryRequest[];
}
  
export interface Product {
    productId: string;
    productName: string;
    description: string;
    brand: string;
    category: string;
    images: string[];
    colors: string[];
    variant: string;
    type: string;
    inventories: Inventory[];
}
  
export interface Inventory {
    inventoryId: string;
    color: string | null;
    quantity: number;
    originalPrice: string | null;
    currentPrice: string | null;
}
  
export interface GroupVariantRequest {
    productIds: string[];
    image: string | null;
    type: string;
    variants: string[];
    productNames: string[];
    defaultOriginalPrices: (string | null)[];
    defaultCurrentPrices: (string | null)[];
}
  
export interface GroupVariant {
    groupId: string;
    productIds: string[];
    image: string | null;
    type: string;
    variants: string[];
    productNames: string[];
    defaultOriginalPrices: (string | null)[];
    defaultCurrentPrices: (string | null)[];
}