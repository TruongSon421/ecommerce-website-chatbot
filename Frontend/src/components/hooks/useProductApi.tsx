// src/hooks/useProductApi.ts
import { useState, useCallback } from 'react';

interface Product {
  productId: string;
  variant: string;
  orderNumber: number;
  productName: string;
  defaultOriginalPrice: string | null;
  defaultCurrentPrice: string | null;
}

interface GroupDto {
  groupId: number;
  orderNumber: number;
  image: string | null;
  type: string;
}

interface GroupProduct {
  products: Product[];
  groupDto: GroupDto;
}

interface ApiResponse {
  content: GroupProduct[]; // Updated to reflect the actual content structure
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
}

const useProductApi = () => {
  const [products, setProducts] = useState<GroupProduct[]>([]); // Changed to GroupProduct[]
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (queryString: string, resetProducts: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = `http://localhost:8070/api/group-variants/groups?${queryString}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as ApiResponse;

      setProducts((prevProducts) =>
        resetProducts ? data.content : [...prevProducts, ...data.content]
      );

      if (resetProducts) {
        setTotalProducts(data.totalElements);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    totalProducts,
    loading,
    error,
    fetchProducts,
  };
};

export default useProductApi;