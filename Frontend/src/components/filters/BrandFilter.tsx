import React from 'react';
import { FilterOption } from '../../types/datafilter';

interface BrandFilterProps {
  brands: FilterOption[];
  selectedBrands: string[];
  onBrandChange: (value: string) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrands,
  onBrandChange
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Hãng</h3>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
        {brands.map((option) => (
          <button
            key={option.value}
            onClick={() => onBrandChange(option.value)}
            className={`border rounded-md py-3 px-4 text-base transition-colors ${
              selectedBrands.includes(option.value)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandFilter;