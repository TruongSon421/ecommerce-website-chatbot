import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupDto } from '../../../types/group';
import { searchProducts } from '../../../services/productService';
import { debounce } from 'lodash';

interface AdminSearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSearchBar: React.FC<AdminSearchPopupProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
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
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Failed to fetch search results:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setLastQuery('');
        setSelectedIndex(-1);
      }
    }, 300),
    [lastQuery]
  );

  useEffect(() => {
    fetchResults(query);
    return () => {
      fetchResults.cancel();
    };
  }, [query, fetchResults]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
      setLastQuery('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleGroupClick = (group: GroupDto) => {
    if (group.productId) {
      const groupType = group.type || 'default';
      navigate(`/admin/detail/${groupType}/${group.productId}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleGroupClick(results[selectedIndex]);
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mt-20 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tìm kiếm sản phẩm... (Nhấn ESC để đóng)"
              className="block w-full pl-10 pr-4 py-3 border-0 text-lg placeholder-gray-500 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
              </svg>
              <span>Đang tìm kiếm...</span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && results.length > 0 && (
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            <div className="py-2">
              {results.map((group, index) => (
                <button
                  key={`${group.groupId}`}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ease-in-out ${
                    index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleGroupClick(group)}
                >
                  <div className="flex items-center">
                    {group.image && (
                      <img
                        src={group.image}
                        alt={group.groupName}
                        className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-lg mb-1">
                        {group.groupName}
                      </div>
                      {group.brand && (
                        <div className="text-sm text-gray-500 mb-1">
                          Thương hiệu: <span className="font-medium">{group.brand}</span>
                        </div>
                      )}
                      {group.type && (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                          {group.type.toUpperCase()}
                        </div>
                      )}
                      {(group.defaultOriginalPrice || group.defaultCurrentPrice) && (
                        <div className="flex items-center space-x-3">
                          {group.defaultOriginalPrice &&
                          group.defaultOriginalPrice > group.defaultCurrentPrice ? (
                            <span className="text-sm text-gray-500 line-through">
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
                    <div className="ml-4 flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && query.trim() && results.length === 0 && (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy kết quả</h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !query.trim() && (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tìm kiếm sản phẩm</h3>
            <p className="mt-1 text-sm text-gray-500">
              Nhập tên sản phẩm, thương hiệu hoặc từ khóa để bắt đầu tìm kiếm
            </p>
            <div className="mt-6">
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  iPhone
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Samsung
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  MacBook
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Dell
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {results.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Tìm thấy {results.length} kết quả</span>
              <div className="flex items-center space-x-4">
                <span>↑↓ Di chuyển</span>
                <span>↵ Chọn</span>
                <span>ESC Đóng</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSearchBar;