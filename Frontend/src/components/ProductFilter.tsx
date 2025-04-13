// src/components/ProductFilter.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Slider } from '@mui/material';
import { filterData } from '../types/datafilter'; // Import filter data from the correct path

interface ProductFilterProps {
  type: string;
  onApplyFilters: (filters: { [key: string]: string[] | number[] }) => void;
  onSortChange: (sortOrder: string) => void;
  sortByPrice: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ type, onApplyFilters, onSortChange, sortByPrice }) => {
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [priceRange, setPriceRange] = useState<number[]>([300000, 45000000]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const currentFilterData = filterData[type.toUpperCase()] || {};

  // Đóng dropdown khi click bên ngoài
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
    setPriceRange(newValue as number[]);
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

  const renderFilterSection = (section: string, isNeedsSection: boolean = false) => {
    const filters = currentFilterData[section] || [];
    return filters.map((filter) => (
      <div key={filter.key} className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{filter.label}</h3>
        <div className={`grid ${isNeedsSection ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {filter.options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-2 ${isNeedsSection ? 'w-full p-2 border border-gray-200 rounded-md' : ''}`}
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

  return (
    <div className="p-4">
      {/* Button Lọc với Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex justify-between items-center border border-blue-500 shadow-sm"
        >
          Lọc
          <svg
            className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-2 w-[600px] bg-white border border-gray-300 rounded-md shadow-lg p-6">
            {/* Phần Hãng */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Hãng</h3>
              <div className="grid grid-cols-8 gap-2">
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

            {/* Phần Giá và Nhu cầu: Chia đôi */}
            <div className="flex gap-4 mb-4">
              {/* Phần Giá (bên trái) */}
              <div className="w-1/2">
                {renderFilterSection('priceRanges')}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Hoặc chọn mức giá phù hợp với bạn</h3>
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

              {/* Phần Nhu cầu (bên phải) */}
              <div className="w-1/2">{renderFilterSection('needs', true)}</div>
            </div>

            {/* Các phần còn lại */}
            {renderFilterSection('privileges')}
            {renderFilterSection('phoneTypes')}
            {renderFilterSection('ram')}
            {renderFilterSection('resolution')}
            {renderFilterSection('refreshRate')}
            {renderFilterSection('cpu')}
            {renderFilterSection('storage')}

            <button
              onClick={handleApply}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 border border-blue-500 shadow-sm"
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>

      {/* Phần Sắp xếp theo: Giá */}
      <div className="flex items-center space-x-2 mt-4">
        <span className="text-gray-700">Sắp xếp theo:</span>
        <div className="relative" ref={sortMenuRef}>
          <button
            onClick={toggleSortMenu}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-1 text-sm border border-gray-300 shadow-sm"
          >
            <span>Giá</span>
            <svg
              className={`w-3 h-3 transform ${isSortMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSortMenuOpen && (
            <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
              <button
                onClick={() => handleSortSelect('desc')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Giá từ cao đến thấp
              </button>
              <button
                onClick={() => handleSortSelect('asc')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

export default ProductFilter;