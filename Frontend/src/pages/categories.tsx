// src/pages/PageCategory.tsx (continued)
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/header';
import ProductList from '../components/productList';
import ProductFilter from '../components/filters/ProductFilter';
import ProductListSkeleton from '../components/ProductListSkeleton';
import useProductApi from '../components/hooks/useProductApi';

function PageCategory() {
  const { type = '' } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<{ [key: string]: string[] | number[] }>({});
  const [sortByPrice, setSortByPrice] = useState<string>('desc');
  const [pageSize] = useState<number>(20); // Define a consistent page size
  
  // Get page from URL params or default to 0
  const page = Number(searchParams.get('page')) || 0;
  
  // Custom hook for product API operations
  const { 
    products, 
    totalProducts, 
    loading, 
    error, 
    fetchProducts 
  } = useProductApi();

  const remainingProducts = totalProducts - products.length;

  // Create query params for API request
  const createQueryParams = useCallback((
    currentPage: number, 
    appliedFilters: { [key: string]: string[] | number[] }
  ) => {
    const queryParams: string[] = [
      `page=${currentPage}`,
      `size=${pageSize}`, // Use the defined page size
      `sortByPrice=${sortByPrice}`
    ];

    if (type) {
      queryParams.push(`type=${type.toUpperCase()}`);
    }

    // Process filters
    const filterMapping = {
      brand: 'brand',
      tags: 'tags',
      ram: 'ram',
      resolution: 'resolution',
      refresh_rate: 'refresh_rate',
      cpu: 'cpu',
      storage: 'storage'
    };

    Object.entries(filterMapping).forEach(([key, param]) => {
      if (appliedFilters[key] && (appliedFilters[key] as string[]).length > 0) {
        queryParams.push(`${param}=${(appliedFilters[key] as string[]).join(',')}`);
      }
    });

    // Process price range
    if (appliedFilters.priceRange) {
      const [minPrice, maxPrice] = appliedFilters.priceRange as number[];
      queryParams.push(`minPrice=${minPrice}`, `maxPrice=${maxPrice}`);
    }

    return queryParams.join('&');
  }, [type, sortByPrice, pageSize]);

  // Fetch products when dependencies change
  useEffect(() => {
    const queryString = createQueryParams(page, filters);
    console.log(`Fetching products for page ${page} with size ${pageSize}`);
    fetchProducts(queryString, page === 0);
  }, [fetchProducts, page, filters, createQueryParams, pageSize]);

  // Save filters to URL without replacing the current page
  useEffect(() => {
    // We need to update URL without triggering a new fetch
    const updatedParams = new URLSearchParams(searchParams);
    
    // Update filters in URL
    updatedParams.set('filters', JSON.stringify(filters));
    
    // Update sort in URL
    updatedParams.set('sort', sortByPrice);
    
    // Only set page if it's not already in the URL to avoid conflicts
    if (!updatedParams.has('page')) {
      updatedParams.set('page', '0');
    }
    
    setSearchParams(updatedParams, { replace: true });
  }, [filters, sortByPrice, setSearchParams]);

  // Restore state from URL on mount only
  useEffect(() => {
    const filtersFromUrl = searchParams.get('filters');
    const sortFromUrl = searchParams.get('sort');
    
    if (filtersFromUrl) {
      try {
        setFilters(JSON.parse(filtersFromUrl));
      } catch (e) {
        console.error('Error parsing filters from URL:', e);
      }
    }
    
    if (sortFromUrl) {
      setSortByPrice(sortFromUrl);
    }
  }, []); // Only run on mount, not when searchParams changes

  const handleLoadMore = () => {
    if (loading) return; // Prevent multiple clicks while loading
    
    const nextPage = page + 1;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', nextPage.toString());
      return newParams;
    });
  };

  const handleApplyFilters = (newFilters: { [key: string]: string[] | number[] }) => {
    setFilters(newFilters);
    // Reset to page 0 when filters change
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      return newParams;
    });
  };

  const handleSortChange = (order: string) => {
    setSortByPrice(order);
    // Reset to page 0 when sort changes
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      return newParams;
    });
  };

  return (
    <div className="pageCategory">
      <Header title={type} />
      <div className="flex flex-col gap-6 p-6">
        <div className="w-full">
          {type ? (
            <ProductFilter
              type={type}
              onApplyFilters={handleApplyFilters}
              onSortChange={handleSortChange}
              sortByPrice={sortByPrice}
              isLoading={loading}
            />
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded-md">
              Không có bộ lọc cho loại sản phẩm này.
            </div>
          )}
        </div>
        <div className="w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Lỗi!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          {loading && products.length === 0 ? (
            <ProductListSkeleton />
          ) : (
            <div className="w-full">
              <ProductList grouplist={products} />
              {remainingProducts > 0 && (
                <div className="flex justify-center mt-6">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md
                             disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tải...
                      </span>
                    ) : (
                      `Xem thêm ${remainingProducts} sản phẩm`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageCategory;
