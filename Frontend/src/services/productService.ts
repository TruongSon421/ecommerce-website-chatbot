// src/api/productApi.ts
import api from '../config/axios';
import { ProductCreateRequest, GroupVariantRequest } from '../types/product';

export const productApi = {
  createProduct: async (data: ProductCreateRequest) => {
    const response = await api.post('/products/create', data);
    return response.data;
  },
  
  createGroupVariant: async (data: GroupVariantRequest) => {
    const response = await api.post('/group-variants', data);
    return response.data;
  },
  
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