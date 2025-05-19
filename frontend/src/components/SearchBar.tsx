import { useState, useEffect, useCallback } from 'react';
import { GroupProductDto } from '../types/product';
import { searchProducts } from '../services/productService';
import { debounce } from 'lodash';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const fetchResults = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery === lastQuery) {
        return;
      }
      if (searchQuery.trim()) {
        try {
          setIsLoading(true);
          const products = await searchProducts(searchQuery);
          setResults(products);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Tìm kiếm sản phẩm (VD: iPhone)..."
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
          {results.map((product) => (
            <li
              key={`${product.productId}-${product.variant || 'default'}`}
              className="p-2 hover:bg-gray-100 cursor-pointer text-gray-900"
            >
              <div className="flex justify-between items-center">
                <span>{product.productName}</span>
                <div className="flex items-center space-x-2">
                  {product.defaultOriginalPrice && product.defaultOriginalPrice > product.defaultCurrentPrice ? (
                    <span className="text-gray-500 line-through">
                      {product.defaultOriginalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  ) : null}
                  <span className="text-green-600">
                    {product.defaultCurrentPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;