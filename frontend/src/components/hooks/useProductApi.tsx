// src/hooks/useProductApi.ts
import { useState, useCallback } from 'react';
import ENV from '../../config/env';

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
  elasticsearchScore?: number; // Score from Elasticsearch for search relevance
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

  const fetchProducts = useCallback(async (queryString: string, resetProducts: boolean = false, isSortedByPrice: boolean = false, hasSearchQuery: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure searchQuery is handled in the queryString formation if passed
      // The actual addition of searchQuery to queryString will be handled by the calling component
      const url = `${ENV.API_URL}/group-variants/groups?${queryString}`;
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
        // Filter out products with elasticsearchScore = 0.0 when searching
        let filteredContent = data.content;
        // if (hasSearchQuery) {
        //   filteredContent = data.content.filter(group => 
        //     group.elasticsearchScore === undefined || group.elasticsearchScore > 0.0
        //   );
        // }
        
        if (resetProducts) {
          // Sort logic based on search type
          if (hasSearchQuery) {
            // When searching, sort by elasticsearchScore (highest first)
            return filteredContent.sort((a, b) => {
              const scoreA = a.elasticsearchScore || 0;
              const scoreB = b.elasticsearchScore || 0;
              return scoreB - scoreA; // Descending order (highest score first)
            });
          } else if (isSortedByPrice) {
            // When sorted by price (not search), keep backend order
            return filteredContent;
          } else {
            // Default sort by orderNumber
            return filteredContent.sort((a, b) => a.groupDto.orderNumber - b.groupDto.orderNumber);
          }
        } else {
          // Merge products for pagination
          const existingGroupIds = new Set(prevProducts.map(group => group.groupDto.groupId));
          const newGroups = filteredContent.filter(group => !existingGroupIds.has(group.groupDto.groupId));
          
          if (hasSearchQuery) {
            // When searching, sort by elasticsearchScore
            const combinedProducts = [...prevProducts, ...newGroups];
            return combinedProducts.sort((a, b) => {
              const scoreA = a.elasticsearchScore || 0;
              const scoreB = b.elasticsearchScore || 0;
              return scoreB - scoreA;
            });
          } else if (isSortedByPrice) {
            // When sorted by price, preserve backend order
            return [...prevProducts, ...newGroups];
          } else {
            // Default sort by orderNumber
            const sortedNewGroups = newGroups.sort((a, b) => a.groupDto.orderNumber - b.groupDto.orderNumber);
            const combinedProducts = [...prevProducts, ...sortedNewGroups];
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