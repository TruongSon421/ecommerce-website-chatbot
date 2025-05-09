// src/components/filters/FilterSection.tsx
import React from 'react';

interface FilterSectionProps {
  section: string;
  currentFilterData: any;
  selectedFilters: { [key: string]: string[] };
  onFilterChange: (key: string, value: string) => void;
  isNeeds?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  section,
  currentFilterData,
  selectedFilters,
  onFilterChange,
  isNeeds = false
}) => {
  const filters = currentFilterData[section] || [];

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
                  type="checkbox"
                  checked={(selectedFilters[filter.key] || []).includes(option.value)}
                  onChange={() => onFilterChange(filter.key, option.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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