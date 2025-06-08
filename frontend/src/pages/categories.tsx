// src/pages/PageCategory.tsx (continued)
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/header';
import ProductList from '../components/product/user/productList';
import ProductFilter from '../components/filters/ProductFilter';
import ProductListSkeleton from '../components/product/ProductListSkeleton';
import useProductApi from '../components/hooks/useProductApi';
import { useAuth } from '../components/hooks/useAuth';
import CategoriesSection from '../components/product/categoriesSection';

function PageCategory() {
  const { type = '' } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<{ [key: string]: string[] | number[] | string }>({});
  const [sortByPrice, setSortByPrice] = useState<string>(''); // Empty string means no price sorting, use orderNumber
  const { isAdmin } = useAuth();
  
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

  // Check if filters are applied
  const hasFiltersApplied = useCallback(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      // For priceRange, check if it's different from default
      if (key === 'priceRange' && Array.isArray(value)) {
        return value[0] !== 0 || value[1] !== 50000000;
      }
      return false;
    });
  }, [filters]);

  // Create query params for API request
  const createQueryParams = useCallback((
    currentPage: number, 
    appliedFilters: { [key: string]: string[] | number[] | string }
  ) => {
    const queryParams: string[] = [
      `page=${currentPage}`,
      `size=20`
    ];

    // Only add sortByPrice if user explicitly chooses price sorting
    if (sortByPrice && (sortByPrice === 'asc' || sortByPrice === 'desc')) {
      queryParams.push(`sortByPrice=${sortByPrice}`);
    }

    if (type) {
      queryParams.push(`type=${type}`);
    }

    // Add search query if present in URL params
    const searchQuery = searchParams.get('search');
    if (searchQuery && searchQuery.trim()) {
      queryParams.push(`searchQuery=${encodeURIComponent(searchQuery.trim())}`);
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
      if (appliedFilters[key] && Array.isArray(appliedFilters[key]) && (appliedFilters[key] as string[]).length > 0) {
        queryParams.push(`${param}=${(appliedFilters[key] as string[]).join(',')}`);
      }
    });

    // Process price range
    if (appliedFilters.priceRange && Array.isArray(appliedFilters.priceRange)) {
      const [minPrice, maxPrice] = appliedFilters.priceRange as number[];
      // Only add price range to query if it's not the default range
      if (minPrice !== 0 || maxPrice !== 50000000) {
        queryParams.push(`minPrice=${minPrice}`, `maxPrice=${maxPrice}`);
      }
    }

    // Process searchQuery from filters if present
    if (appliedFilters.searchQuery && typeof appliedFilters.searchQuery === 'string' && appliedFilters.searchQuery.trim()) {
      queryParams.push(`searchQuery=${encodeURIComponent(appliedFilters.searchQuery.trim())}`);
    }

    return queryParams.join('&');
  }, [type, sortByPrice, searchParams]);

  // Fetch products when dependencies change
  useEffect(() => {
    const queryString = createQueryParams(page, filters);
    const isSortedByPrice = sortByPrice === 'asc' || sortByPrice === 'desc';
    console.log('Fetching products with filters:', filters, 'queryString:', queryString);
    fetchProducts(queryString, page === 0, isSortedByPrice);
  }, [fetchProducts, page, filters, createQueryParams, sortByPrice]);

  // Save filters to URL
  useEffect(() => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...currentParams,
      filters: JSON.stringify(filters),
      sort: sortByPrice,
      page: page.toString()
    }, { replace: true }); // Use replace to avoid adding multiple history entries
  }, [filters, sortByPrice, page, setSearchParams, searchParams]);

  // Restore state from URL on mount
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
  }, [searchParams]); // Only run on mount

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', nextPage.toString());
      return newParams;
    });
  };

  const handleApplyFilters = (newFilters: { [key: string]: string[] | number[] | string }) => {
    console.log('Applying filters:', newFilters);
    
    // Clean up priceRange if it's at default value
    const cleanedFilters = { ...newFilters };
    if (cleanedFilters.priceRange && Array.isArray(cleanedFilters.priceRange)) {
      const [min, max] = cleanedFilters.priceRange as number[];
      console.log('PriceRange detected:', min, max);
      // Remove priceRange if it's at default value (0 to 50000000)
      if (min === 0 && max === 50000000) {
        console.log('Removing default priceRange from filters');
        delete cleanedFilters.priceRange;
      }
    }
    
    console.log('Cleaned filters:', cleanedFilters);
    setFilters(cleanedFilters);
    
    // Reset to page 0 when filters change
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      
      // If empty filters, remove the filters param from URL
      if (Object.keys(cleanedFilters).length === 0) {
        console.log('Removing filters from URL (empty)');
        newParams.delete('filters');
      } else {
        console.log('Setting filters in URL:', JSON.stringify(cleanedFilters));
      }
      
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

  const handleClearFilters = () => {
    setFilters({});
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      newParams.delete('filters');
      return newParams;
    });
  };

  const categories = [
    {
      id: 1,
      name: 'Phone',
      imageSrc: '/images/categories/phone.png',
      link: '/admin/products/phone'
    },
    {
      id: 2,
      name: 'Laptop',
      imageSrc: '/images/categories/laptop.png',
      link: '/admin/products/laptop'
    },
    {
      id: 3,
      name: 'Tablet',
      imageSrc: '/images/categories/tablet.png',
      link: '/admin/products/tablet'
    },
    {
      id: 4,
      name: 'Audio',
      imageSrc: '/images/categories/audio.png',
      link: '/admin/products/audio'
    },
    {
      id: 5,
      name: 'Phụ kiện',
      imageSrc: '/images/categories/Phukien.png',
      link: '/admin/products/phukien'
    }
  ];

  // No products found component
  const NoProductsFound = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-24 h-24 mb-6 text-gray-300">
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
          <path d="M9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Không tìm thấy sản phẩm phù hợp
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        Vui lòng thử bộ lọc khác hoặc xóa một số tiêu chí để xem thêm sản phẩm.
      </p>
      {hasFiltersApplied() && (
        <button
          onClick={handleClearFilters}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="pageCategory">
      {/* Conditionally render categories section for admin */}
      {isAdmin && (
        <CategoriesSection categories={categories} />
      )}
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
          ) : products.length === 0 && !loading ? (
            <NoProductsFound />
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