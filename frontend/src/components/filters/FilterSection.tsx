// src/components/filters/FilterSection.tsx
import React from 'react';

interface FilterSectionProps {
  section: string;
  currentFilterData: any;
  selectedFilters: { [key: string]: string[] };
  onFilterChange: (key: string, value: string) => void;
  onPriceRangeChange?: (newValue: number[]) => void;
  isNeeds?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  section,
  currentFilterData,
  selectedFilters,
  onFilterChange,
  onPriceRangeChange,
  isNeeds = false
}) => {
  const filters = currentFilterData[section] || [];
  
  // Check if this is a price filter section
  const isPriceFilter = section === 'priceRanges';

  // Handle filter change with special case for price ranges
  const handleFilterChange = (key: string, value: string) => {
    // If selecting a predefined price range, reset the custom price range to default
    if (key === 'priceRanges' && onPriceRangeChange) {
      onPriceRangeChange([300000, 45000000]);
    }
    
    onFilterChange(key, value);
  };

  return (
    <>
      {filters.map((filter: any) => (
        <div key={filter.key} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{filter.label}</h3>
          <div className={`grid ${isNeeds ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            {filter.options.map((option: any) => (
              <label
                key={option.value}
                className={`flex items-center space-x-2 cursor-pointer ${
                  isNeeds ? 'w-full p-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors' : ''
                }`}
              >
                <input
                  type={isPriceFilter || filter.multiSelect === false ? "radio" : "checkbox"}
                  checked={(selectedFilters[filter.key] || []).includes(option.value)}
                  onChange={() => handleFilterChange(filter.key, option.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  name={isPriceFilter || filter.multiSelect === false ? filter.key : undefined}
                />
                <span className={`text-sm ${isNeeds ? 'truncate' : ''}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default FilterSection;