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
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [priceRange, setPriceRange] = useState<number[]>([300000, 45000000]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentFilterData = filterData[type] || {};

  // Calculate number of active filters
  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilters({});
    setPriceRange([300000, 45000000]);
    setSearchQuery('');
    onApplyFilters({}); // Let the parent handle URL updates
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
      
      // For price filters or non-multiSelect filters, replace the current selection
      if (key === 'price' || key === 'priceRanges' || !isMultiSelect) {
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

  const handlePriceRangeChange = (newValue: number[]) => {
    setPriceRange(newValue);
  };

  const handleApply = () => {
    // Send filter data to parent component
    onApplyFilters({
      ...selectedFilters,
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
      {/* Flex container for Button and Search Input */}
      <div className="flex items-center gap-4 mb-4">
        {/* Filter Button and Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            disabled={isLoading}
          >
            <span>Lọc</span>
            {getSelectedFiltersCount() > 0 && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs">
                {getSelectedFiltersCount()}
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
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onApply={handleApply}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Search Query Input - flex-grow to take remaining space */}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Tìm kiếm thông số kỹ thuật (vd: ip68)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Moved Reset Button and Active Filters to be outside the flex container of button/search */}
      {getSelectedFiltersCount() > 0 && (
        <div className="mb-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Active filters display */}
      {getSelectedFiltersCount() > 0 && (
        <ActiveFilters
          selectedFilters={selectedFilters}
          currentFilterData={currentFilterData}
          onRemoveFilter={handleFilterChange}
        />
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