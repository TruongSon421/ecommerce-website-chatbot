import React, { useState, useEffect } from 'react';
import { Slider, TextField } from '@mui/material';
import { debounce } from 'lodash';
import BrandFilter from './BrandFilter';
import FilterSection from './FilterSection';
import { PRICE_RANGES } from '../../types/datafilter';

interface FilterDropdownProps {
  currentFilterData: any;
  selectedFilters: { [key: string]: string[] };
  priceRange: number[];
  searchQuery: string;
  onFilterChange: (key: string, value: string) => void;
  onPriceRangeChange: (newValue: number[]) => void;
  onSearchQueryChange: (value: string) => void;
  onApply: () => void;
  isLoading: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  currentFilterData,
  selectedFilters,
  priceRange,
  searchQuery,
  onFilterChange,
  onPriceRangeChange,
  onSearchQueryChange,
  onApply,
  isLoading,
}) => {
  // State to control custom price range
  const [showCustomPriceRange, setShowCustomPriceRange] = useState(true);
  
  // Debounced price range change
  const debouncedPriceChange = debounce((newValue: number[]) => {
    onPriceRangeChange(newValue);
  }, 300);

  // Hàm chuyển đổi giá trị button giá thành min/max
  const parsePriceRangeValue = (value: string): { min: number; max: number } => {
    const [minStr, maxStr] = value.split('-');
    const min = minStr ? parseInt(minStr, 10) : 0;
    const max = maxStr ? parseInt(maxStr, 10) : 50000000;
    
    return { min, max };
  };

  // Hàm kiểm tra xem custom price range có trùng với button giá nào không
  const findMatchingPriceRange = (min: number, max: number): string | null => {
    // Lấy danh sách price ranges từ currentFilterData.priceRanges (section có filter với key 'price')
    const priceRangesSection = currentFilterData.priceRanges?.[0]?.options || [];
    
    for (const option of priceRangesSection) {
      const { min: optionMin, max: optionMax } = parsePriceRangeValue(option.value);
      
      if (min === optionMin && max === optionMax) {
        return option.value;
      }
    }
    return null;
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    
    // Kiểm tra xem có button giá nào trùng với khoảng giá này không
    const matchingRange = findMatchingPriceRange(min, max);
    
    if (matchingRange) {
      // Nếu trùng với button giá → chọn button giá và ẩn custom range
      if (selectedFilters.price && selectedFilters.price.length > 0) {
        // Xóa button giá cũ trước
        selectedFilters.price.forEach(value => {
          onFilterChange('price', value);
        });
      }
      // Chọn button giá mới
      onFilterChange('price', matchingRange);
      setShowCustomPriceRange(false);
    } else {
      // Nếu không trùng → xóa button giá đã chọn và hiển thị custom range
      if (selectedFilters.price && selectedFilters.price.length > 0) {
        selectedFilters.price.forEach(value => {
          onFilterChange('price', value);
        });
      }
      setShowCustomPriceRange(true);
    }
    
    debouncedPriceChange(newValue as number[]);
  };

  // State tạm thời cho input giá
  const [inputMinPrice, setInputMinPrice] = useState(priceRange[0].toString());
  const [inputMaxPrice, setInputMaxPrice] = useState(priceRange[1].toString());

  // Đồng bộ input với priceRange khi priceRange thay đổi
  React.useEffect(() => {
    setInputMinPrice(priceRange[0].toString());
    setInputMaxPrice(priceRange[1].toString());
  }, [priceRange]);

  // Xử lý thay đổi từ input
  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (type === 'min') {
      setInputMinPrice(numericValue);
      const min = numericValue ? parseInt(numericValue, 10) : 0;
      if (min <= priceRange[1]) {
        const matchingRange = findMatchingPriceRange(min, priceRange[1]);
        if (matchingRange && selectedFilters.price?.[0] !== matchingRange) {
          // Chuyển sang button giá nếu trùng
          if (selectedFilters.price && selectedFilters.price.length > 0) {
            selectedFilters.price.forEach(val => onFilterChange('price', val));
          }
          onFilterChange('price', matchingRange);
          setShowCustomPriceRange(false);
        } else if (!matchingRange) {
          // Xóa button giá nếu không trùng
          if (selectedFilters.price && selectedFilters.price.length > 0) {
            selectedFilters.price.forEach(val => onFilterChange('price', val));
          }
          setShowCustomPriceRange(true);
        }
        onPriceRangeChange([min, priceRange[1]]);
      }
    } else {
      setInputMaxPrice(numericValue);
      const max = numericValue ? parseInt(numericValue, 10) : 50000000;
      if (max >= priceRange[0]) {
        const matchingRange = findMatchingPriceRange(priceRange[0], max);
        if (matchingRange && selectedFilters.price?.[0] !== matchingRange) {
          // Chuyển sang button giá nếu trùng
          if (selectedFilters.price && selectedFilters.price.length > 0) {
            selectedFilters.price.forEach(val => onFilterChange('price', val));
          }
          onFilterChange('price', matchingRange);
          setShowCustomPriceRange(false);
        } else if (!matchingRange) {
          // Xóa button giá nếu không trùng
          if (selectedFilters.price && selectedFilters.price.length > 0) {
            selectedFilters.price.forEach(val => onFilterChange('price', val));
          }
          setShowCustomPriceRange(true);
        }
        onPriceRangeChange([priceRange[0], max]);
      }
    }
  };

  // Xử lý khi input mất focus để đảm bảo giá trị hợp lệ
  const handleInputBlur = (type: 'min' | 'max') => {
    let min = parseInt(inputMinPrice, 10) || 0;
    let max = parseInt(inputMaxPrice, 10) || 50000000;

    min = Math.max(0, Math.min(min, 50000000));
    max = Math.max(0, Math.min(max, 50000000));

    if (min > max) {
      min = max;
    }
    if (max < min) {
      max = min;
    }

    // Kiểm tra xem có trùng với button giá nào không
    const matchingRange = findMatchingPriceRange(min, max);
    if (matchingRange && selectedFilters.price?.[0] !== matchingRange) {
      if (selectedFilters.price && selectedFilters.price.length > 0) {
        selectedFilters.price.forEach(val => onFilterChange('price', val));
      }
      onFilterChange('price', matchingRange);
      setShowCustomPriceRange(false);
    } else if (!matchingRange) {
      if (selectedFilters.price && selectedFilters.price.length > 0) {
        selectedFilters.price.forEach(val => onFilterChange('price', val));
      }
      setShowCustomPriceRange(true);
    }

    onPriceRangeChange([min, max]);
    setInputMinPrice(min.toString());
    setInputMaxPrice(max.toString());
  };

  // Hàm định dạng giá trị hiển thị
  const formatPrice = (value: number) => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  // Hàm xóa khoảng giá
  const handleRemovePriceRange = () => {
    // Xóa tất cả price buttons đã chọn trước
    if (selectedFilters.price && selectedFilters.price.length > 0) {
      selectedFilters.price.forEach(value => {
        onFilterChange('price', value);
      });
    }
    
    // Reset price range và show custom range
    onPriceRangeChange([0, 50000000]);
    setShowCustomPriceRange(true);
    
    // Auto-apply sau khi state đã update
    queueMicrotask(() => {
      onApply();
    });
  };

  // Hàm hiển thị nhãn cho bộ lọc
  const getFilterLabel = (key: string, value: string): string => {
    // Tìm trong tất cả các filter của key
    const filterSections = Object.values(currentFilterData);
    
    for (const section of filterSections as any[]) {
      for (const filter of section) {
        if (filter.key === key) {
          const option = filter.options?.find((opt: { value: string; label: string }) => opt.value === value);
          if (option) return option.label;
        }
      }
    }
    
    // Nếu không tìm thấy label, loại bỏ prefix nếu có dấu '_'
    if (value.includes('_')) {
      // Split by underscore, remove the first part (prefix), join with space
      // and capitalize first letter of each word
      return value
        .split('_')
        .slice(1)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return value;
  };

  // Kiểm tra xem có button giá nào được chọn không
  const hasPriceRangeSelected = selectedFilters.price && selectedFilters.price.length > 0;
  
  // Kiểm tra xem có sử dụng custom price range không (khác với giá trị mặc định - toàn bộ range)
  const hasCustomPriceRange = priceRange[0] !== 0 || priceRange[1] !== 50000000;

  // Logic hiển thị custom price range:
  // - Hiển thị khi chưa chọn button giá hoặc khi showCustomPriceRange = true
  // - Ẩn khi đã chọn button giá và showCustomPriceRange = false
  React.useEffect(() => {
    if (hasPriceRangeSelected) {
      // Khi chọn button giá → đồng bộ custom price range với giá trị button
      const selectedValue = selectedFilters.price?.[0];
      if (selectedValue) {
        const { min, max } = parsePriceRangeValue(selectedValue);
        // Chỉ cập nhật nếu giá trị khác nhau để tránh vòng lặp
        if (priceRange[0] !== min || priceRange[1] !== max) {
          onPriceRangeChange([min, max]);
        }
      }
      setShowCustomPriceRange(false);
    } else {
      // Khi không có button giá → hiển thị custom price range
      setShowCustomPriceRange(true);
    }
  }, [hasPriceRangeSelected]);

  return (
    <div className="absolute z-10 mt-2 w-[600px] max-w-[95vw] bg-white border border-gray-300 rounded-md shadow-lg p-6">
      {/* Search Query Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm thông số kỹ thuật
        </label>
        <input
          type="text"
          placeholder="Tìm kiếm thông số kỹ thuật (vd: ip68)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Selected Filters Section - Đặt ở đầu */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Đã chọn</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(selectedFilters).flatMap(([key, values]) =>
            values.map((value) => (
              <span
                key={`${key}-${value}`}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                {getFilterLabel(key, value)}
                <button
                  onClick={() => {
                    onFilterChange(key, value);
                    // Auto-apply sau khi state đã update
                    queueMicrotask(() => {
                      onApply();
                    });
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
            ))
          )}
          {/* Hiển thị khoảng giá custom chỉ khi không có button giá nào được chọn */}
          {!hasPriceRangeSelected && hasCustomPriceRange && (
            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              {priceRange[0] === priceRange[1]
                ? `Giá: ${formatPrice(priceRange[0])}`
                : `Giá: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
              <button
                onClick={handleRemovePriceRange}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="Remove price range"
              >
                ×
              </button>
            </span>
          )}
        </div>
        {Object.keys(selectedFilters).length === 0 &&
          !hasCustomPriceRange && (
            <p className="text-sm text-gray-500">Chưa có bộ lọc nào được chọn.</p>
          )}
      </div>

      {/* Brand Section */}
      <BrandFilter
        brands={currentFilterData.brands?.[0]?.options || []}
        selectedBrands={selectedFilters.brand || []}
        onBrandChange={(value) => onFilterChange('brand', value)}
      />

      {/* Price and Needs Sections */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/2">
          <FilterSection
            section="priceRanges"
            currentFilterData={currentFilterData}
            selectedFilters={selectedFilters}
            onFilterChange={(key, value) => {
              onFilterChange(key, value);
              
              if (key === 'priceRanges') {
                const isCurrentlySelected = (selectedFilters[key] || []).includes(value);
                
                if (!isCurrentlySelected) {
                  // Đang chọn button giá → cập nhật custom price range và ẩn nó
                  const { min, max } = parsePriceRangeValue(value);
                  onPriceRangeChange([min, max]);
                  setShowCustomPriceRange(false);
                } else {
                  // Đang bỏ chọn button giá → hiển thị lại custom price range
                  setShowCustomPriceRange(true);
                }
              }
            }}
            onPriceRangeChange={onPriceRangeChange}
          />
          
          {/* Custom Price Range Section */}
          {(showCustomPriceRange && !hasPriceRangeSelected) ? (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Hoặc chọn mức giá phù hợp với bạn</h3>
              <div className="flex items-center gap-2 mb-3">
                <TextField
                  value={inputMinPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  onChange={(e) => handleInputChange('min', e.target.value)}
                  onBlur={() => handleInputBlur('min')}
                  placeholder="0"
                  variant="outlined"
                  size="small"
                  sx={{ width: '120px' }}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
                <span>-</span>
                <TextField
                  value={inputMaxPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  onChange={(e) => handleInputChange('max', e.target.value)}
                  onBlur={() => handleInputBlur('max')}
                  placeholder="50.000.000"
                  variant="outlined"
                  size="small"
                  sx={{ width: '120px' }}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </div>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="off"
                min={0}
                max={50000000}
                step={100000}
                sx={{
                  color: '#3b82f6',
                  height: 6,
                  '& .MuiSlider-thumb': {
                    height: 16,
                    width: 16,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                  },
                  '& .MuiSlider-track': {
                    height: 6,
                  },
                  '& .MuiSlider-rail': {
                    height: 6,
                    backgroundColor: '#e5e7eb',
                  },
                }}
              />
            </div>
          ) : hasPriceRangeSelected ? (
            <div className="mb-4">
              <button 
                onClick={() => {
                  setShowCustomPriceRange(true);
                  if (selectedFilters.price && selectedFilters.price.length > 0) {
                    selectedFilters.price.forEach(value => onFilterChange('price', value));
                  }
                  // Auto-apply sau khi state đã update
                  queueMicrotask(() => {
                    onApply();
                  });
                }}
                className="text-blue-500 hover:text-blue-700 font-medium flex items-center p-2 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Hoặc chọn mức giá phù hợp với bạn
              </button>
            </div>
          ) : null}
        </div>
        <div className="w-full md:w-1/2">
          <FilterSection
            section="needs"
            currentFilterData={currentFilterData}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            isNeeds={true}
          />
        </div>
      </div>

      {/* Other Filter Sections */}
      <FilterSection section="privileges" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="phoneTypes" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="ram" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="resolution" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="refreshRate" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="cpu" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="storage" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />

      <button
        onClick={onApply}
        className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Đang áp dụng...' : 'Áp dụng'}
      </button>
    </div>
  );
};

export default FilterDropdown;