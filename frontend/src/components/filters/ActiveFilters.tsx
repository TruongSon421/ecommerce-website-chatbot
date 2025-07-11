// src/components/filters/ActiveFilters.tsx
import React from 'react';

interface ActiveFiltersProps {
  selectedFilters: { [key: string]: string[] };
  currentFilterData: any;
  onRemoveFilter: (key: string, value: string) => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedFilters,
  currentFilterData,
  onRemoveFilter
}) => {
  // Helper function to get label for a filter value
  const getFilterLabel = (key: string, value: string): string => {
    // Tìm trong tất cả các filter của key - sử dụng cùng logic với FilterDropdown
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

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(selectedFilters).map(([key, values]) =>
        values.map((value) => (
          <span
            key={`${key}-${value}`}
            className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
          >
            {getFilterLabel(key, value)}
            <button
              onClick={() => onRemoveFilter(key, value)}
              className="ml-1 text-blue-600 hover:text-blue-800"
              aria-label="Remove filter"
            >
              ×
            </button>
          </span>
        ))
      )}
    </div>
  );
};

export default ActiveFilters;