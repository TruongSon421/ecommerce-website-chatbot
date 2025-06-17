// src/pages/PageCategory.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/header';
import ProductList from '../components/product/user/productList';
import ProductFilter from '../components/filters/ProductFilter';
import ProductListSkeleton from '../components/product/ProductListSkeleton';
import useProductApi from '../components/hooks/useProductApi';
import { useAuth } from '../components/hooks/useAuth';
import CategoriesSection from '../components/product/categoriesSection';

// Helper function to get display name for subtype
const getSubtypeDisplayName = (subtype: string): string => {
  const subtypeNames: { [key: string]: string } = {
    'wireless_earphone': 'Tai nghe không dây',
    'wired_earphone': 'Tai nghe có dây',
    'headphone': 'Tai nghe chụp tai',
    'backup_charger': 'Sạc dự phòng',
  };
  return subtypeNames[subtype] || subtype;
};

const getTypeDisplayName = (type: string): string => {
  const typeNames: { [key: string]: string } = {
    'phone': 'Điện thoại',
    'laptop': 'Máy tính', 
  };
  return typeNames[type] || type;
};

function PageCategory() {
  const { type = '', subtype = '' } = useParams<{ type: string; subtype?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<{ [key: string]: string[] | number[] | string }>({});
  
  // Storage key for sortByPrice persistence per category
  const SORT_STORAGE_KEY = `sortByPrice_${type}`;
  
  // Initialize sortByPrice without localStorage - always start fresh
  const [sortByPrice, setSortByPrice] = useState<string>('');
  
  // Track previous type to detect category changes
  const [prevType, setPrevType] = useState<string>(type);
  
  const { isAdmin } = useAuth();
  
  // Track if initial state has been restored
  const [isStateRestored, setIsStateRestored] = useState(false);
  
  // Get page from URL params or default to 0
  const page = Number(searchParams.get('page')) || 0;
  
  // Reset sort when category type changes
  useEffect(() => {
    if (prevType !== type) {
      console.log(`Category changed from ${prevType} to ${type}, resetting sort order`);
      
      // Reset sort order (will already be empty due to fresh initialization)
      setSortByPrice('');
      
      // Update URL to remove sort parameter
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('sort');
        newParams.set('page', '0'); // Reset to first page
        return newParams;
      });
      
      // Update previous type tracker
      setPrevType(type);
    }
  }, [type, prevType]);

  // Don't save sortByPrice to localStorage - we want it to reset when leaving page
  // Remove the localStorage save effect to ensure sort resets when navigating away
  
  // Cleanup effect - clear sort when leaving the category page
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts (when leaving the page)
      console.log(`Leaving category ${type}, clearing sort order`);
      try {
        localStorage.removeItem(SORT_STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear sortByPrice from localStorage on cleanup:', error);
      }
    };
  }, [type, SORT_STORAGE_KEY]);

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

  // Create query params for API request - memoized with stable dependencies
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

    // Use subtype as type if it exists, otherwise use type
    const effectiveType = subtype || type;
    if (effectiveType) {
      queryParams.push(`type=${effectiveType}`);
    }

    // Handle search query from filters
    if (appliedFilters.searchQuery && typeof appliedFilters.searchQuery === 'string' && appliedFilters.searchQuery.trim()) {
      queryParams.push(`searchQuery=${encodeURIComponent(appliedFilters.searchQuery.trim())}`);
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

    return queryParams.join('&');
  }, [type, subtype, sortByPrice]); // Added subtype to dependencies

  // Fetch products when dependencies change, but only after state is restored
  useEffect(() => {
    // Don't fetch until initial state is restored
    if (!isStateRestored) return;
    
    const queryString = createQueryParams(page, filters);
    const isSortedByPrice = sortByPrice === 'asc' || sortByPrice === 'desc';
    
    // Check if there's a search query (either from filters or URL)
    const hasSearchQuery = !!(filters.searchQuery || searchParams.get('search'));
    
    console.log('Fetching products with filters:', filters, 'queryString:', queryString, 'hasSearchQuery:', hasSearchQuery);
    fetchProducts(queryString, page === 0, isSortedByPrice, hasSearchQuery);
  }, [page, filters, sortByPrice, isStateRestored]); // Removed createQueryParams, fetchProducts, searchParams from dependencies

  // Save filters to URL
  useEffect(() => {
    if (!isStateRestored) return; // Don't update URL until state is restored
    
    const newParams = new URLSearchParams();
    newParams.set('page', page.toString());
    
    // Only add filters to URL if they exist and are not empty
    if (filters && Object.keys(filters).length > 0) {
      newParams.set('filters', JSON.stringify(filters));
    }
    
    // Only add sort to URL if it's not empty
    if (sortByPrice && sortByPrice !== '') {
      newParams.set('sort', sortByPrice);
    }
    
    // Only update URL if it's actually different from current
    const currentParams = searchParams.toString();
    const newParamsString = newParams.toString();
    
    if (currentParams !== newParamsString) {
      console.log('Updating URL params from:', currentParams, 'to:', newParamsString);
      setSearchParams(newParams, { replace: true });
    }
  }, [filters, sortByPrice, page, isStateRestored]); // Removed searchParams and setSearchParams from dependencies

  // Initialize state on mount - only once
  useEffect(() => {
    const filtersFromUrl = searchParams.get('filters');
    const sortFromUrl = searchParams.get('sort');
    const searchFromUrl = searchParams.get('search');
    
    console.log('Initial mount - restoring state from URL');
    
    // Restore filters from URL
    if (filtersFromUrl && filtersFromUrl !== 'undefined') {
      try {
        const parsedFilters = JSON.parse(filtersFromUrl);
        if (parsedFilters && Object.keys(parsedFilters).length > 0) {
          console.log('Setting initial filters from URL:', parsedFilters);
          setFilters(parsedFilters);
        }
      } catch (e) {
        console.error('Error parsing filters from URL:', e);
      }
    }
    
    // Restore search query from URL parameters (fallback)
    if (searchFromUrl && searchFromUrl.trim() && !filtersFromUrl) {
      console.log('Setting initial search from URL param:', searchFromUrl);
      setFilters(prev => ({
        ...prev,
        searchQuery: searchFromUrl.trim()
      }));
    }
    
    // Don't restore sort from URL or localStorage - always start fresh
    // This ensures sort resets when user navigates back to category page
    console.log('Starting fresh - no sort restoration for new category visit');
    
    // Note: No need to auto-apply subtype filter since subtype is now used directly as type in API

    // Mark state as restored
    setIsStateRestored(true);
  }, []); // Empty dependency array - only run once on mount

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', nextPage.toString());
      
      // Preserve existing filters and sort parameters
      const currentFilters = prev.get('filters');
      const currentSort = prev.get('sort');
      
      if (currentFilters && currentFilters !== 'undefined') {
        newParams.set('filters', currentFilters);
      }
      
      if (currentSort && currentSort !== '' && currentSort !== 'undefined') {
        newParams.set('sort', currentSort);
      }
      
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
    
    console.log('Cleaned filters before applying:', cleanedFilters);
    setFilters(cleanedFilters);
    
    // Reset to page 0 when filters change
    // Keep sort order when applying filters (user choice)
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      
      // Keep the sort parameter if it exists (don't reset when applying filters)
      const currentSort = prev.get('sort');
      if (currentSort && currentSort !== '' && currentSort !== 'undefined') {
        newParams.set('sort', currentSort);
      }
      
      // If empty filters, remove the filters param from URL
      if (Object.keys(cleanedFilters).length === 0) {
        console.log('Removing filters from URL (empty)');
        newParams.delete('filters');
      } else {
        console.log('Setting filters in URL:', JSON.stringify(cleanedFilters));
        newParams.set('filters', JSON.stringify(cleanedFilters));
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

  const handleSortReset = () => {
    console.log('Resetting sort order due to filter removal');
    setSortByPrice('');
    
    // Update URL to remove sort parameter
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('sort');
      return newParams;
    });
  };

  const handleClearFilters = () => {
    setFilters({});
    // Reset sort order when clearing filters in same category
    setSortByPrice('');
    
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      newParams.delete('filters');
      newParams.delete('sort'); // Remove sort when clearing filters
      
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
      name: 'Audio',
      imageSrc: '/images/categories/audio.png',
      link: '/admin/products/audio'
    },
    {
      id: 4,
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
      <Header title={subtype ? getSubtypeDisplayName(subtype) : getTypeDisplayName(type)} />
      <div className="flex flex-col gap-6 p-6">
        <div className="w-full">
          {type ? (
            <ProductFilter
              type={type}
              onApplyFilters={handleApplyFilters}
              onSortChange={handleSortChange}
              onSortReset={handleSortReset}
              sortByPrice={sortByPrice}
              isLoading={loading}
              initialFilters={isStateRestored && Object.keys(filters).length > 0 ? filters : {}} // Chỉ truyền khi có filters và state đã restored
              key={`${type}-${JSON.stringify(filters)}`} // Force re-render khi filters thay đổi
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