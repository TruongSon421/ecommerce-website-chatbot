import React, { useState } from 'react';
import { Slider, TextField } from '@mui/material';
import { debounce } from 'lodash';
import BrandFilter from './BrandFilter';
import FilterSection from './FilterSection';

interface FilterDropdownProps {
  currentFilterData: any;
  selectedFilters: { [key: string]: string[] };
  priceRange: number[];
  onFilterChange: (key: string, value: string) => void;
  onPriceRangeChange: (newValue: number[]) => void;
  onApply: () => void;
  isLoading: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  currentFilterData,
  selectedFilters,
  priceRange,
  onFilterChange,
  onPriceRangeChange,
  onApply,
  isLoading,
}) => {
  // Debounced price range change
  const debouncedPriceChange = debounce((newValue: number[]) => {
    onPriceRangeChange(newValue);
  }, 300);

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
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
      const min = numericValue ? parseInt(numericValue, 10) : 300000;
      if (min <= priceRange[1]) {
        onPriceRangeChange([min, priceRange[1]]);
      }
    } else {
      setInputMaxPrice(numericValue);
      const max = numericValue ? parseInt(numericValue, 10) : 45000000;
      if (max >= priceRange[0]) {
        onPriceRangeChange([priceRange[0], max]);
      }
    }
  };

  // Xử lý khi input mất focus để đảm bảo giá trị hợp lệ
  const handleInputBlur = (type: 'min' | 'max') => {
    let min = parseInt(inputMinPrice, 10) || 300000;
    let max = parseInt(inputMaxPrice, 10) || 45000000;

    min = Math.max(300000, Math.min(min, 45000000));
    max = Math.max(300000, Math.min(max, 45000000));

    if (min > max) {
      min = max;
    }
    if (max < min) {
      max = min;
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
    onPriceRangeChange([300000, 45000000]);
  };

  // Hàm hiển thị nhãn cho bộ lọc
  const getFilterLabel = (key: string, value: string) => {
    // Xử lý đặc biệt cho needs
    if (key === 'needs' && currentFilterData.needs?.[0]?.options) {
      const option = currentFilterData.needs[0].options.find(
        (opt: { value: string }) => opt.value === value
      );
      return option?.label || value;
    }
    // Xử lý các danh mục khác
    const filter = currentFilterData[key]?.[0];
    if (!filter) return value;
    const option = filter.options?.find((opt: { value: string }) => opt.value === value);
    return option?.label || value;
  };

  return (
    <div className="absolute z-10 mt-2 w-[600px] max-w-[95vw] bg-white border border-gray-300 rounded-md shadow-lg p-6">
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
                  onClick={() => onFilterChange(key, value)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
            ))
          )}
          {priceRange[0] !== 300000 || priceRange[1] !== 45000000 ? (
            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              Giá: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              <button
                onClick={handleRemovePriceRange}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="Remove price range"
              >
                ×
              </button>
            </span>
          ) : null}
        </div>
        {Object.keys(selectedFilters).length === 0 &&
          priceRange[0] === 300000 &&
          priceRange[1] === 45000000 && (
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
            onFilterChange={onFilterChange}
          />
          {/* Price Range Slider */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Hoặc chọn mức giá phù hợp với bạn</h3>
            <div className="flex items-center gap-2 mb-3">
              <TextField
                value={inputMinPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                onChange={(e) => handleInputChange('min', e.target.value)}
                onBlur={() => handleInputBlur('min')}
                placeholder="300.000"
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
                placeholder="45.000.000"
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
              min={300000}
              max={45000000}
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