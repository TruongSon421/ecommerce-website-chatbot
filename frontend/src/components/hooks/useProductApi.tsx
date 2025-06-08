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

  const fetchProducts = useCallback(async (queryString: string, resetProducts: boolean = false, isSortedByPrice: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure searchQuery is handled in the queryString formation if passed
      // The actual addition of searchQuery to queryString will be handled by the calling component
      const url = `http://localhost:8070/api/group-variants/groups?${queryString}`;
      console.log('Fetching products with URL:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as ApiResponse;
      console.log('API response:', {
        totalElements: data.totalElements,
        size: data.size,
        number: data.number,
        contentLength: data.content.length
      });

      // Always update total products count to ensure it's accurate
      setTotalProducts(data.totalElements);
      
      setProducts((prevProducts) => {
        if (resetProducts) {
          // Sort by orderNumber only if not sorted by price
          if (isSortedByPrice) {
            return data.content; // Keep the order from backend (sorted by price)
          } else {
            const sortedContent = data.content.sort((a, b) => a.groupDto.orderNumber - b.groupDto.orderNumber);
            return sortedContent;
          }
        } else {
          // Merge products, ensuring no duplicates by checking groupId
          const existingGroupIds = new Set(prevProducts.map(group => group.groupDto.groupId));
          const newGroups = data.content.filter(group => !existingGroupIds.has(group.groupDto.groupId));
          
          if (isSortedByPrice) {
            // When sorted by price, preserve the order from backend
            return [...prevProducts, ...newGroups];
          } else {
            // Sort new groups by orderNumber before adding
            const sortedNewGroups = newGroups.sort((a, b) => a.groupDto.orderNumber - b.groupDto.orderNumber);
            const combinedProducts = [...prevProducts, ...sortedNewGroups];
            // Sort the entire combined list by orderNumber
            return combinedProducts.sort((a, b) => a.groupDto.orderNumber - b.groupDto.orderNumber);
          }
        }
      });
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