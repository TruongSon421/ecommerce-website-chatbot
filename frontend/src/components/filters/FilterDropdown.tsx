import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  
  // Local state for smooth slider interaction - không trigger re-render của parent
  const [localPriceRange, setLocalPriceRange] = useState<number[]>(priceRange);
  
  // Sync local state with prop changes
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  // Optimized debounced price change with longer delay for smoother experience
  const debouncedPriceChange = useMemo(
    () => debounce((newValue: number[]) => {
      onPriceRangeChange(newValue);
    }, 500), // Increased from 300ms to 500ms for smoother sliding
    [onPriceRangeChange]
  );

  // Memoize price ranges for better performance
  const priceRangeOptions = useMemo(() => {
    return currentFilterData.priceRanges?.[0]?.options || [];
  }, [currentFilterData.priceRanges]);

  // Hàm chuyển đổi giá trị button giá thành min/max
  const parsePriceRangeValue = useCallback((value: string): { min: number; max: number } => {
    const [minStr, maxStr] = value.split('-');
    const min = minStr ? parseInt(minStr, 10) : 0;
    const max = maxStr ? parseInt(maxStr, 10) : 200000000;
    
    return { min, max };
  }, []);

  // Optimized function để kiểm tra xem custom price range có trùng với button giá nào không
  const findMatchingPriceRange = useCallback((min: number, max: number): string | null => {
    for (const option of priceRangeOptions) {
      const { min: optionMin, max: optionMax } = parsePriceRangeValue(option.value);
      
      if (min === optionMin && max === optionMax) {
        return option.value;
      }
    }
    return null;
  }, [priceRangeOptions, parsePriceRangeValue]);

  // Optimized slider change handler - chỉ update local state ngay lập tức
  const handlePriceRangeChange = useCallback((event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    
    // Update local state immediately for smooth UI
    setLocalPriceRange([min, max]);
    
    // Debounce the expensive operations
    debouncedPriceChange([min, max]);
  }, [debouncedPriceChange]);

  // Simplified price matching logic - no automatic selections to avoid loops
  useEffect(() => {
    const [min, max] = priceRange;
    const matchingRange = findMatchingPriceRange(min, max);
    
    if (matchingRange && selectedFilters.price?.includes(matchingRange)) {
      // Nếu có button giá trùng và đã được chọn → ẩn custom range
      setShowCustomPriceRange(false);
    } else {
      // Trong tất cả các trường hợp khác → hiển thị custom range
      setShowCustomPriceRange(true);
    }
  }, [priceRange, findMatchingPriceRange, selectedFilters.price]);

  // State tạm thời cho input giá
  const [inputMinPrice, setInputMinPrice] = useState(priceRange[0].toString());
  const [inputMaxPrice, setInputMaxPrice] = useState(priceRange[1].toString());

  // Đồng bộ input với localPriceRange để cập nhật ngay lập tức khi kéo slider
  React.useEffect(() => {
    setInputMinPrice(localPriceRange[0].toString());
    setInputMaxPrice(localPriceRange[1].toString());
  }, [localPriceRange]);

  // Debounced input change handler
  const debouncedInputChange = useMemo(
    () => debounce((type: 'min' | 'max', numericValue: string) => {
      if (type === 'min') {
        const min = numericValue ? parseInt(numericValue, 10) : 0;
        if (min <= priceRange[1]) {
          onPriceRangeChange([min, priceRange[1]]);
        }
      } else {
        const max = numericValue ? parseInt(numericValue, 10) : 200000000;
        if (max >= priceRange[0]) {
          onPriceRangeChange([priceRange[0], max]);
        }
      }
    }, 300),
    [onPriceRangeChange, priceRange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedPriceChange.cancel();
      debouncedInputChange.cancel();
    };
  }, [debouncedPriceChange, debouncedInputChange]);

  // Xử lý thay đổi từ input - optimized for performance
  const handleInputChange = useCallback((type: 'min' | 'max', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (type === 'min') {
      setInputMinPrice(numericValue);
      // Update local state immediately for instant feedback
      const min = numericValue ? parseInt(numericValue, 10) : 0;
      setLocalPriceRange([min, localPriceRange[1]]);
      // Trigger debounced change for actual update
      debouncedInputChange(type, numericValue);
    } else {
      setInputMaxPrice(numericValue);
      // Update local state immediately for instant feedback
      const max = numericValue ? parseInt(numericValue, 10) : 200000000;
      setLocalPriceRange([localPriceRange[0], max]);
      // Trigger debounced change for actual update
      debouncedInputChange(type, numericValue);
    }
  }, [debouncedInputChange, localPriceRange]);

  // Xử lý khi input mất focus để đảm bảo giá trị hợp lệ - optimized
  const handleInputBlur = useCallback((type: 'min' | 'max') => {
    let min = parseInt(inputMinPrice, 10) || 0;
    let max = parseInt(inputMaxPrice, 10) || 200000000;

    min = Math.max(0, Math.min(min, 200000000));
    max = Math.max(0, Math.min(max, 200000000));

    if (min > max) {
      min = max;
    }
    if (max < min) {
      max = min;
    }

    // Only update if values actually changed
    if (min !== priceRange[0] || max !== priceRange[1]) {
      onPriceRangeChange([min, max]);
    }

    setInputMinPrice(min.toString());
    setInputMaxPrice(max.toString());
  }, [inputMinPrice, inputMaxPrice, priceRange, onPriceRangeChange]);

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
    onPriceRangeChange([0, 200000000]);
    setShowCustomPriceRange(true);
    
    // Chỉ xóa khoảng giá, không tự động áp dụng
  };

  // Hàm hiển thị nhãn cho bộ lọc - Updated để hỗ trợ tags tốt hơn
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
    
    // Fallback cho tag values - parse tag names để hiển thị thân thiện hơn
    if (value.includes('_')) {
      // Special handling for common tag patterns
      if (value.startsWith('phone_')) {
        return parsePhoneTag(value);
      } else if (value.startsWith('laptop_')) {
        return parseLaptopTag(value);
      } else if (value.startsWith('earHeadphone_')) {
        return parseEarHeadphoneTag(value);
      } else if (value.startsWith('backupCharger_')) {
        return parseBackupChargerTag(value);
      }
      
      // Generic parsing for other tags
      return value
        .split('_')
        .slice(1)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return value;
  };

  // Helper functions to parse specific tag types
  const parsePhoneTag = (tag: string): string => {
    const tagMap: { [key: string]: string } = {
      'phone_highSpecs': 'Chơi game / Cấu hình cao',
      'phone_battery': 'Pin khủng trên 5000 mAh',
      'phone_camera': 'Chụp ảnh, quay phim',
      'phone_livestream': 'Livestream',
      'phone_slimLight': 'Mỏng nhẹ',
      'phone_specialFeature_5g': 'Hỗ trợ 5G',
      'phone_specialFeature_aiEdit': 'Chỉnh sửa ảnh AI',
      'phone_specialFeature_waterDustProof': 'Kháng nước, bụi',
      'phone_charge_fastCharge20': 'Sạc nhanh (từ 20W)',
      'phone_charge_superFastCharge60': 'Sạc siêu nhanh (từ 60W)',
      'phone_charge_wirelessCharge': 'Sạc không dây'
    };
    return tagMap[tag] || tag;
  };

  const parseLaptopTag = (tag: string): string => {
    const tagMap: { [key: string]: string } = {
      'laptop_gaming': 'Chơi game / Cấu hình cao',
      'laptop_office': 'Học tập - Văn phòng',
      'laptop_design': 'Đồ họa - Kỹ thuật',
      'laptop_slimLight': 'Mỏng nhẹ',
      'laptop_screen_13inch': 'Khoảng 13 inch',
      'laptop_screen_14inch': 'Khoảng 14 inch',
      'laptop_screen_15inch': 'Khoảng 15 inch',
      'laptop_screen_16inch': 'Trên 16 inch',
      'laptop_specialFeature_touchScreen': 'Cảm ứng',
      'laptop_specialFeature_oled': 'Màn hình OLED',
      'laptop_specialFeature_antiGlare': 'Chống chói',
      'laptop_specialFeature_360': 'Gập 360 độ'
    };
    return tagMap[tag] || tag;
  };

  const parseEarHeadphoneTag = (tag: string): string => {
    const tagMap: { [key: string]: string } = {
      'earHeadphone_tech_boneConduction': 'Dẫn truyền qua xương',
      'earHeadphone_tech_airConduction': 'Dẫn truyền qua khí',
      'earHeadphone_battery_under4': 'Dưới 4 tiếng',
      'earHeadphone_battery_4to6': 'Từ 4 đến 6 tiếng',
      'earHeadphone_battery_6to8': 'Từ 6 đến 8 tiếng',
      'earHeadphone_battery_above8': 'Trên 8 tiếng',
      'earHeadphone_benefit_wirelessCharge': 'Sạc không dây',
      'earHeadphone_benefit_waterProof': 'Chống nước',
      'earHeadphone_benefit_mic': 'Mic đàm thoại',
      'earHeadphone_benefit_anc': 'Chống ồn ANC',
      'earHeadphone_benefit_enc': 'Chống ồn ENC'
    };
    return tagMap[tag] || tag;
  };

  const parseBackupChargerTag = (tag: string): string => {
    const tagMap: { [key: string]: string } = {
      'backupCharger_type_smallLight': 'Mỏng nhẹ',
      'backupCharger_type_forLaptop': 'Cho laptop',
      'backupCharger_battery_10k': '10.000 mAh',
      'backupCharger_battery_20k': '20.000 mAh',
      'backupCharger_battery_above20k': 'Trên 20.000 mAh',
      'backupCharger_benefit_wirelessCharge': 'Sạc không dây',
      'backupCharger_benefit_fastCharge': 'Sạc nhanh',
      'backupCharger_benefit_magsafe': 'Magsafe/Magnetic'
    };
    return tagMap[tag] || tag;
  };

  // Kiểm tra xem có button giá nào được chọn không
  const hasPriceRangeSelected = selectedFilters.price && selectedFilters.price.length > 0;
  
  // Kiểm tra xem có sử dụng custom price range không (khác với giá trị mặc định - toàn bộ range)
  const hasCustomPriceRange = priceRange[0] !== 0 || priceRange[1] !== 200000000;

  // Đồng bộ custom price range với button giá đã chọn
  React.useEffect(() => {
    if (hasPriceRangeSelected) {
      const selectedValue = selectedFilters.price?.[0];
      if (selectedValue) {
        const { min, max } = parsePriceRangeValue(selectedValue);
        // Chỉ cập nhật nếu giá trị khác nhau để tránh vòng lặp
        if (priceRange[0] !== min || priceRange[1] !== max) {
          onPriceRangeChange([min, max]);
        }
      }
    }
  }, [hasPriceRangeSelected, selectedFilters.price, parsePriceRangeValue, priceRange, onPriceRangeChange]);

  return (
    <div className="absolute z-10 mt-2 w-[600px] max-w-[95vw] max-h-[80vh] overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg p-6">
      {/* Search Query Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm thông số kỹ thuật
        </label>
        <input
          type="text"
<<<<<<< HEAD
          placeholder="vd: ip68,... (Kết quả được sắp xếp lại theo độ tương đồng)"
=======
          placeholder="vd: ip68, ram tối thiểu 12gb,... "
>>>>>>> server
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
                    // Chỉ xóa filter, không tự động áp dụng
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
              
              if (key === 'price') {
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
                  placeholder="200.000.000"
                  variant="outlined"
                  size="small"
                  sx={{ width: '120px' }}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
              </div>
              <Slider
                value={localPriceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="off"
                min={0}
                max={200000000}
                step={100000}
                sx={{
                  color: '#3b82f6',
                  height: 6,
                  '& .MuiSlider-thumb': {
                    height: 16,
                    width: 16,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    transition: 'none', // Remove transition for smoother dragging
                  },
                  '& .MuiSlider-track': {
                    height: 6,
                    transition: 'none', // Remove transition for smoother dragging
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
                  // Chỉ chuyển về custom price range, không tự động áp dụng
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

      {/* Product-Specific Filter Sections - Updated order and organization */}
      {/* Phone specific sections */}
      <FilterSection section="specialFeatures" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="chargeFeatures" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      
      {/* Laptop specific sections */}
      <FilterSection section="screen" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      
      {/* Audio specific sections */}
      <FilterSection section="connectivity" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="earphoneTechnology" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="earphoneBattery" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="earphoneBenefits" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      
      {/* Phukien specific sections */}
      <FilterSection section="backupChargerType" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="backupChargerBattery" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="backupChargerBenefits" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />

      {/* Legacy sections - keep for backward compatibility if needed */}
      <FilterSection section="privileges" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="phoneTypes" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="ram" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="resolution" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="refreshRate" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="cpu" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="storage" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="subcategories" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />
      <FilterSection section="capacity" currentFilterData={currentFilterData} selectedFilters={selectedFilters} onFilterChange={onFilterChange} />

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