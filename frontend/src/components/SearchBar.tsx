import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupDto } from '../types/group';
import { searchProducts } from '../services/productService';
import { debounce } from 'lodash';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
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

  // Handle clicks outside the search bar to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle group click to navigate to first product's detail page
  const handleGroupClick = (group: GroupDto) => {
    if (group.productId) {
      const groupType = group.type || 'default';
      navigate(`/${groupType}/${group.productId}`);
      setResults([]);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Tìm kiếm nhóm sản phẩm (VD: Điện thoại)..."
        className="w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isLoading && (
        <div className="absolute top-0 right-0 p-2">
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
      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto text-gray-900">
          {results.map((group) => (
            <li
              key={`${group.groupId}`}
              className="p-2 hover:bg-gray-100 cursor-pointer text-gray-900 flex items-center"
              onClick={() => handleGroupClick(group)}
            >
              {group.image && (
                <img
                  src={group.image}
                  alt={group.groupName}
                  className="w-12 h-12 object-cover rounded-md mr-3"
                />
              )}
              <div className="flex-1">
                <span className="font-medium">{group.groupName}</span>
                {group.brand && (
                  <span className="text-sm text-gray-500 block">{group.brand}</span>
                )}
                {(group.defaultOriginalPrice || group.defaultCurrentPrice) && (
                  <div className="flex items-center space-x-2 mt-1">
                    {group.defaultOriginalPrice &&
                    group.defaultOriginalPrice > group.defaultCurrentPrice ? (
                      <span className="text-gray-500 line-through">
                        {group.defaultOriginalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    ) : null}
                    {group.defaultCurrentPrice && (
                      <span className="text-green-600">
                        {group.defaultCurrentPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
