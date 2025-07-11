// src/components/filters/SortMenu.tsx
import React, { useState, useRef, useEffect } from 'react';

interface SortMenuProps {
  sortByPrice: string;
  onSortChange: (sortOrder: string) => void;
  isLoading: boolean;
}

const SortMenu: React.FC<SortMenuProps> = ({ sortByPrice, onSortChange, isLoading }) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSortMenu = () => {
    setIsSortMenuOpen((prev) => !prev);
  };

  const handleSortSelect = (order: string) => {
    onSortChange(order);
    setIsSortMenuOpen(false);
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      <span className="text-white">Sắp xếp theo:</span>
      <div className="relative" ref={sortMenuRef}>
        <button
          onClick={toggleSortMenu}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center space-x-1 text-sm transition-colors"
          disabled={isLoading}
        >
          <span>Giá</span>
          <svg
            className={`w-3 h-3 transform ${isSortMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isSortMenuOpen && (
          <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
            <button
              onClick={() => handleSortSelect('desc')}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                sortByPrice === 'desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Giá từ cao đến thấp
            </button>
            <button
              onClick={() => handleSortSelect('asc')}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                sortByPrice === 'asc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Giá từ thấp đến cao
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortMenu;