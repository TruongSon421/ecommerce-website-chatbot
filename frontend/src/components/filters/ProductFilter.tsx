import React, { useState, useRef, useEffect } from 'react';
import FilterDropdown from './FilterDropdown';
import SortMenu from './SortMenu';
import ActiveFilters from './ActiveFilters';
import FilterSkeleton from './FilterSkeleton';
import { filterData } from '../../types/datafilter';

interface ProductFilterProps {
  type: string;
  onApplyFilters: (filters: { [key: string]: string[] | number[] | string }) => void;
  onSortChange: (sortOrder: string) => void;
  sortByPrice: string; // Có thể là '' (không sắp xếp), 'asc', hoặc 'desc'
  isLoading?: boolean;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  type,
  onApplyFilters,
  onSortChange,
  sortByPrice,
  isLoading = false,
}) => {
  // Storage keys for persisting state
  const STORAGE_KEY_FILTERS = `productFilters_${type}`;
  const STORAGE_KEY_PRICE_RANGE = `priceRange_${type}`;
  const STORAGE_KEY_SEARCH = `searchQuery_${type}`;

  // Helper functions for localStorage
  const saveToStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const loadFromStorage = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  };

  // Initialize state with persisted values
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>(() => 
    loadFromStorage(STORAGE_KEY_FILTERS, {})
  );
  const [priceRange, setPriceRange] = useState<number[]>(() => 
    loadFromStorage(STORAGE_KEY_PRICE_RANGE, [0, 50000000])
  );
  const [searchQuery, setSearchQuery] = useState<string>(() => 
    loadFromStorage(STORAGE_KEY_SEARCH, '')
  );
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldAutoApply, setShouldAutoApply] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentFilterData = filterData[type] || {};

  // Auto-apply effect when shouldAutoApply flag is set
  useEffect(() => {
    if (shouldAutoApply) {
      handleApply();
      setShouldAutoApply(false);
    }
  }, [selectedFilters, searchQuery, shouldAutoApply]);

  // Restore filters on component mount
  useEffect(() => {
    const hasPersistedFilters = Object.keys(selectedFilters).length > 0 || 
                               searchQuery.trim() !== '' ||
                               (priceRange[0] !== 0 || priceRange[1] !== 50000000);
    
    if (hasPersistedFilters) {
      // Apply persisted filters
      handleApply();
    }
  }, []); // Only run on mount

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEY_FILTERS, selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_PRICE_RANGE, priceRange);
  }, [priceRange]);

  useEffect(() => {
    saveToStorage(STORAGE_KEY_SEARCH, searchQuery);
  }, [searchQuery]);

  // Calculate number of active filters
  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilters({});
    setPriceRange([0, 50000000]);
    setSearchQuery('');
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY_FILTERS);
      localStorage.removeItem(STORAGE_KEY_PRICE_RANGE);
      localStorage.removeItem(STORAGE_KEY_SEARCH);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    // Apply empty filters to trigger data reload
    onApplyFilters({});
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[key] || [];
      
      // Check if this is a price filter or a filter with multiSelect=false
      const filterSection = Object.values(currentFilterData).find(section => 
        section.some((filter: any) => filter.key === key)
      );
      
      const filter = filterSection?.find((f: any) => f.key === key);
      const isMultiSelect = filter?.multiSelect !== false;
      
      // Special handling for price filters - convert to priceRange
      if (key === 'price') {
        if (currentValues.includes(value)) {
          // Deselecting - reset to full range
          setPriceRange([0, 50000000]);
          return {
            ...prev,
            [key]: []
          };
        } else {
          // Selecting a price range - parse and update priceRange
          const [minStr, maxStr] = value.split('-');
          const min = minStr ? parseInt(minStr, 10) : 0;
          const max = maxStr ? parseInt(maxStr, 10) : 50000000;
          setPriceRange([min, max]);
          
          return {
            ...prev,
            [key]: [value]
          };
        }
      }
      
      // For other price filters or non-multiSelect filters, replace the current selection
      if (key === 'priceRanges' || !isMultiSelect) {
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [key]: []
          };
        } else {
          return {
            ...prev,
            [key]: [value]
          };
        }
      }
      
      // For other filters, toggle as before
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [key]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [key]: [...currentValues, value],
        };
      }
    });
  };

  // Handle removing filter and auto-apply
  const handleRemoveFilter = (key: string, value: string) => {
    handleFilterChange(key, value);
    // Trigger auto-apply using flag instead of setTimeout
    setShouldAutoApply(true);
  };

  // Handle removing search query and auto-apply
  const handleRemoveSearchQuery = () => {
    setSearchQuery('');
    // Trigger auto-apply using flag instead of setTimeout
    setShouldAutoApply(true);
  };

  const handlePriceRangeChange = (newValue: number[]) => {
    setPriceRange(newValue);
  };

  const handleApply = () => {
    // Remove price filter since we're using priceRange instead
    const filtersToSend = { ...selectedFilters };
    delete filtersToSend.price;
    
    // Send filter data to parent component
    onApplyFilters({
      ...filtersToSend,
      priceRange,
      searchQuery,
    });

    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  if (isLoading) {
    return <FilterSkeleton />;
  }

  return (
    <div className="p-4">
      {/* Filter Button and Dropdown */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            disabled={isLoading}
          >
            <span>Lọc</span>
            {(getSelectedFiltersCount() > 0 || searchQuery.trim()) && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs">
                {getSelectedFiltersCount() + (searchQuery.trim() ? 1 : 0)}
              </span>
            )}
            <svg
              className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <FilterDropdown
              currentFilterData={currentFilterData}
              selectedFilters={selectedFilters}
              priceRange={priceRange}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onSearchQueryChange={setSearchQuery}
              onApply={handleApply}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Reset Button and Active Filters */}
      {(getSelectedFiltersCount() > 0 || searchQuery.trim()) && (
        <div className="mb-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Active filters display */}
      {getSelectedFiltersCount() > 0 && (
        <ActiveFilters
          selectedFilters={selectedFilters}
          currentFilterData={currentFilterData}
          onRemoveFilter={handleRemoveFilter}
        />
      )}

      {/* Show search query as active filter if present */}
      {searchQuery.trim() && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              Tìm kiếm: "{searchQuery}"
              <button
                onClick={handleRemoveSearchQuery}
                className="ml-1 text-green-600 hover:text-green-800"
                aria-label="Remove search"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Sort Menu */}
      <SortMenu
        sortByPrice={sortByPrice}
        onSortChange={onSortChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductFilter;