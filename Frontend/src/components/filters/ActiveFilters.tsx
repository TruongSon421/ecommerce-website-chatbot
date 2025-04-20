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
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(selectedFilters).map(([key, values]) =>
        values.map((value) => (
          <span
            key={`${key}-${value}`}
            className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
          >
            {currentFilterData[key]?.[0]?.options.find((opt: { value: string; }) => opt.value === value)?.label}
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