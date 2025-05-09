import React, { useState, useRef, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom'; // Nếu dùng React Router
import FilterDropdown from './FilterDropdown';
import SortMenu from './SortMenu';
import ActiveFilters from './ActiveFilters';
import FilterSkeleton from './FilterSkeleton';
import { filterData } from '../../types/datafilter';

interface ProductFilterProps {
  type: string;
  onApplyFilters: (filters: { [key: string]: string[] | number[] }) => void;
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const history = useNavigate(); // Nếu dùng React Router

  const currentFilterData = filterData[type.toUpperCase()] || {};

  // Calculate number of active filters
  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).reduce((acc, curr) => acc + curr.length, 0);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilters({});
    setPriceRange([300000, 45000000]);
    onApplyFilters({});
    // Cập nhật URL khi reset, không thêm sort nếu không cần
    const queryParams = new URLSearchParams();
    queryParams.set('page', '0');
    if (sortByPrice) {
      queryParams.set('sort', sortByPrice);
    }
    history(`/phone?${queryParams.toString()}`);
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
    // Tạo query params thân thiện
    const queryParams = new URLSearchParams();
    queryParams.set('page', '0');

    // Chỉ thêm sort nếu sortByPrice có giá trị rõ ràng
    if (sortByPrice) {
      queryParams.set('sort', sortByPrice);
    }

    // Thêm selectedFilters vào query
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        queryParams.set(key, values.join(',')); // Ví dụ: needs=phone_highSpecs,gaming
      }
    });

    // Chỉ thêm priceRange nếu khác mặc định
    if (priceRange[0] !== 300000 || priceRange[1] !== 45000000) {
      queryParams.set('price_min', priceRange[0].toString());
      queryParams.set('price_max', priceRange[1].toString());
    }

    // Gọi onApplyFilters với dữ liệu gốc
    onApplyFilters({
      ...selectedFilters,
      priceRange,
    });

    // Cập nhật URL
    history(`/phone?${queryParams.toString()}`);

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