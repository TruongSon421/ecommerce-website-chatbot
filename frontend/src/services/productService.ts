// src/api/productApi.ts
import api from '../config/axios';
<<<<<<< HEAD
import { ProductCreateRequest, GroupVariantRequest, GroupProductDto } from '../types/product';
=======
import { ProductCreateRequest, GroupVariantRequest, GroupProductDto, BulkGroupCreateRequest, BulkGroupCreateResponse } from '../types/product';
>>>>>>> server




export const searchProducts = async (query: string): Promise<GroupProductDto[]> => {
  try {
    if (!query.trim()) {
      return [];
    }
    const response = await api.get<GroupProductDto[]>('/group-variants/search', {
      params: { query },
    });
    // Lấy top 5 sản phẩm
    return response.data.slice(0, 5);
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to search products';
    console.error('Search products failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const productApi = {
  createProduct: async (data: ProductCreateRequest) => {
    const response = await api.post('/products/create', data);
    return response.data;
  },
  
  createGroupVariant: async (data: GroupVariantRequest) => {
    const response = await api.post('/group-variants', data);
    return response.data;
  },
  
<<<<<<< HEAD
=======
  createBulkProductGroup: async (data: BulkGroupCreateRequest): Promise<BulkGroupCreateResponse> => {
    const response = await api.post('/products/create-bulk-group', data);
    return response.data;
  },
  
>>>>>>> server
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getProductById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  updateProduct: async (id: number, data: ProductCreateRequest) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  getAllGroupVariants: async () => {
    const response = await api.get('/group-variants');
    return response.data;
  }
};