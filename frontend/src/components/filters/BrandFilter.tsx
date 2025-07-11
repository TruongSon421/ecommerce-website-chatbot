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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
        {brands.map((option) => (
          <button
            key={option.value}
            onClick={() => onBrandChange(option.value)}
            className={`border rounded-md py-2 px-2 text-sm font-medium transition-colors text-center truncate min-h-[2.5rem] flex items-center justify-center ${
              selectedBrands.includes(option.value)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
            }`}
            title={option.label} // Tooltip hiển thị tên đầy đủ khi hover
          >
            <span className="truncate w-full">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandFilter;