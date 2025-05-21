import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@mui/material';
import { filterData } from '../types/datafilter';
import { debounce } from 'lodash';

interface ProductFilterProps {
  type: string;
  onApplyFilters: (filters: { [key: string]: string[] | number[] }) => void;
  onSortChange: (sortOrder: string) => void;
  sortByPrice: string;
  isLoading?: boolean;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ 
  type, 
  onApplyFilters, 
  onSortChange, 
  sortByPrice,
  isLoading = false 
}) => {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [priceRange, setPriceRange] = useState<number[]>([300000, 45000000]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const currentFilterData = filterData[type.toUpperCase()] || {};

  // Tính toán số lượng filter đã chọn
  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedFilters({});
    setPriceRange([300000, 45000000]);
    onApplyFilters({});
  };

  // Debounced price range change
  const debouncedPriceChange = debounce((newValue: number[]) => {
    setPriceRange(newValue);
  }, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
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

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    debouncedPriceChange(newValue as number[]);
  };

  const handleApply = () => {
    onApplyFilters({
      ...selectedFilters,
      priceRange,
    });
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleSortMenu = () => {
    setIsSortMenuOpen((prev) => !prev);
  };

  const handleSortSelect = (order: string) => {
    onSortChange(order);
    setIsSortMenuOpen(false);
  };

  // Hiển thị active filters
  const renderActiveFilters = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(selectedFilters).map(([key, values]) =>
          values.map((value) => {
            // Tìm label đúng cho value
            const filters = currentFilterData[key] || [];
            let label = value;
            for (const filter of filters) {
              const found = filter.options.find(opt => opt.value === value);
              if (found) {
                label = found.label;
                break;
              }
            }
            return (
              <span
                key={`${key}-${value}`}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                {label}
                <button
                  onClick={() => handleFilterChange(key, value)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            );
          })
        )}
      </div>
    );
  };

  const renderFilterSection = (section: string, isNeedsSection: boolean = false) => {
    const filters = currentFilterData[section] || [];
    return filters.map((filter) => (
      <div key={filter.key} className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{filter.label}</h3>
        <div className={`grid ${isNeedsSection ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {filter.options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-2 ${
                isNeedsSection ? 'w-full p-2 border border-gray-200 rounded-md' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={(selectedFilters[filter.key] || []).includes(option.value)}
                onChange={() => handleFilterChange(filter.key, option.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className={`text-sm ${isNeedsSection ? 'truncate' : ''}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return <FilterSkeleton />;
  }

  return (
    <div className="p-4">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex justify-between items-center"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <span>Lọc</span>
            {getSelectedFiltersCount() > 0 && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-sm">
                {getSelectedFiltersCount()}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {getSelectedFiltersCount() > 0 && (
          <button
            onClick={handleResetFilters}
            className="mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Xóa bộ lọc
          </button>
        )}

        {isDropdownOpen && (
          <div className="absolute z-10 mt-2 w-[600px] max-w-[95vw] bg-white border border-gray-300 rounded-md shadow-lg p-6">
            {renderActiveFilters()}
            
            {/* Phần Hãng */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Hãng</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {currentFilterData.brands?.[0]?.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('brand', option.value)}
                    className={`border rounded-md py-2 px-3 text-sm ${
                      (selectedFilters.brand || []).includes(option.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Phần Giá và Nhu cầu */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-1/2">
                {renderFilterSection('priceRanges')}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Chọn khoảng giá</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                    <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
                  </div>
                  <Slider
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    valueLabelDisplay="off"
                    min={300000}
                    max={45000000}
                    step={100000}
                    className="text-blue-500"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                {renderFilterSection('needs', true)}
              </div>
            </div>

            {/* Các section filter khác */}
            {renderFilterSection('privileges')}
            {renderFilterSection('phoneTypes')}
            {renderFilterSection('ram')}
            {renderFilterSection('resolution')}
            {renderFilterSection('refreshRate')}
            {renderFilterSection('cpu')}
            {renderFilterSection('storage')}

            <button
              onClick={handleApply}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? 'Đang áp dụng...' : 'Áp dụng'}
            </button>
          </div>
        )}
      </div>

      {/* Sort Menu */}
      <div className="flex items-center space-x-2 mt-4">
        <span className="text-gray-700">Sắp xếp theo:</span>
        <div className="relative" ref={sortMenuRef}>
          <button
            onClick={toggleSortMenu}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-1 text-sm"
            disabled={isLoading}
          >
            <span>Giá</span>
            <svg
              className={`w-3 h-3 transform ${isSortMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSortMenuOpen && (
            <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
              <button
                onClick={() => handleSortSelect('desc')}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  sortByPrice === 'desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Giá từ cao đến thấp
              </button>
              <button
                onClick={() => handleSortSelect('asc')}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  sortByPrice === 'asc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Giá từ thấp đến cao
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const FilterSkeleton = () => (
  <div className="animate-pulse p-4">
    <div className="h-10 bg-gray-200 rounded-md mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  </div>
);

export default ProductFilter;