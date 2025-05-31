// src/components/filters/FilterSkeleton.tsx
import React from 'react';

const FilterSkeleton: React.FC = () => (
  <div className="animate-pulse p-4">
    <div className="h-10 bg-gray-200 rounded-md mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  </div>
);

export default FilterSkeleton;