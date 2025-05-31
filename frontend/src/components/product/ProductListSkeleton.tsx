import React from 'react';

interface ProductListSkeletonProps {
  itemCount?: number;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ itemCount = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="mt-4 flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductListSkeleton;