import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupDto } from '../../../types/group';
import { searchProducts } from '../../../services/productService';
import { debounce } from 'lodash';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchResults = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery === lastQuery) {
        return;
      }
      if (searchQuery.trim()) {
        try {
          setIsLoading(true);
          const groups = await searchProducts(searchQuery);
          setResults(groups);
          setLastQuery(searchQuery);
        } catch (error) {
          console.error('Failed to fetch search results:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setLastQuery('');
      }
    }, 500),
    [lastQuery]
  );

  useEffect(() => {
    fetchResults(query);
    return () => {
      fetchResults.cancel();
    };
  }, [query, fetchResults]);

  // Auto focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle clicks outside the search bar to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Handle escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle group click to navigate to first product's detail page
  const handleGroupClick = (group: GroupDto) => {
    if (group.productId) {
      const groupType = group.type || 'default';
      navigate(`/detail/${groupType}/${group.productId}`);
      onClose(); // Close popup after navigation
    }
  };

  // Reset search when popup closes
  const handleClose = () => {
    setQuery('');
    setResults([]);
    setLastQuery('');
    onClose();
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Search popup */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        <div 
          ref={searchRef}
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
        >
          {/* Search header */}
          <div className="flex items-center p-4 border-b">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Tìm kiếm nhóm sản phẩm (VD: Điện thoại)..."
                className="w-full p-3 pr-12 border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="ml-3 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search results */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim() && results.length === 0 && !isLoading && (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Không tìm thấy kết quả nào cho "{query}"</p>
              </div>
            )}
            
            {results.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {results.map((group) => (
                  <li
                    key={`${group.groupId}`}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center"
                    onClick={() => handleGroupClick(group)}
                  >
                    {group.image && (
                      <img
                        src={group.image}
                        alt={group.groupName}
                        className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{group.groupName}</h3>
                      {group.brand && (
                        <p className="text-sm text-gray-500 mt-1">{group.brand}</p>
                      )}
                      {(group.defaultOriginalPrice || group.defaultCurrentPrice) && (
                        <div className="flex items-center space-x-2 mt-2">
                          {group.defaultOriginalPrice &&
                          group.defaultOriginalPrice > group.defaultCurrentPrice ? (
                            <span className="text-sm text-gray-400 line-through">
                              {group.defaultOriginalPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          ) : null}
                          {group.defaultCurrentPrice && (
                            <span className="text-lg font-semibold text-green-600">
                              {group.defaultCurrentPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                ))}
              </ul>
            )}

            {!query.trim() && (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p>Nhập từ khóa để tìm kiếm sản phẩm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;