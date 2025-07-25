<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import FilterDropdown from './FilterDropdown';
import SortMenu from './SortMenu';
import ActiveFilters from './ActiveFilters';
import FilterSkeleton from './FilterSkeleton';
import { filterData } from '../../types/datafilter';
import { isAudioSubtype, getAudioFilterData } from '../../utils/audioFilterHelper';

interface ProductFilterProps {
  type: string;
  onApplyFilters: (filters: { [key: string]: string[] | number[] | string }) => void;
  onSortChange: (sortOrder: string) => void;
  onSortReset?: () => void; // Callback để reset sort khi xóa filter
  sortByPrice: string;
  isLoading?: boolean;
  initialFilters?: { [key: string]: string[] | number[] | string }; // Thêm prop này
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  type,
  onApplyFilters,
  onSortChange,
  onSortReset,
  sortByPrice,
  isLoading = false,
  initialFilters = {}, // Default empty object
}) => {
  // Storage keys for persisting state
  const STORAGE_KEY_FILTERS = `productFilters_${type}`;
  const STORAGE_KEY_PRICE_RANGE = `priceRange_${type}`;
  const STORAGE_KEY_SEARCH = `searchQuery_${type}`;

  // Initialize state with initialFilters taking priority over localStorage
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>(() => {
    // Check if we have initialFilters from URL/chatbot
    if (Object.keys(initialFilters).length > 0) {
      console.log('Initializing filters from initialFilters:', initialFilters);
      
      const processedFilters: { [key: string]: string[] } = {};
      
      // Handle brand
      if (initialFilters.brand && Array.isArray(initialFilters.brand)) {
        processedFilters.brand = initialFilters.brand as string[];
      }
      
      // Handle tags
      if (initialFilters.tags && Array.isArray(initialFilters.tags)) {
        processedFilters.tags = initialFilters.tags as string[];
      }
      
      return processedFilters;
    }
    
    // Don't load from localStorage to prevent filter persistence across categories
    return {};
  });

  // Add separate state for applied filters - only these will show as tags
  const [appliedFilters, setAppliedFilters] = useState<{ [key: string]: string[] }>(() => {
    // Initialize with initialFilters if available
    if (Object.keys(initialFilters).length > 0) {
      const processedFilters: { [key: string]: string[] } = {};
      
      // Handle brand
      if (initialFilters.brand && Array.isArray(initialFilters.brand)) {
        processedFilters.brand = initialFilters.brand as string[];
      }
      
      // Handle tags
      if (initialFilters.tags && Array.isArray(initialFilters.tags)) {
        processedFilters.tags = initialFilters.tags as string[];
      }
      
      return processedFilters;
    }
    
    return {};
  });

  const [priceRange, setPriceRange] = useState<number[]>(() => {
    // Check if we have initialFilters with priceRange
    if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
      console.log('Initializing price range from initialFilters:', initialFilters.priceRange);
      return initialFilters.priceRange as number[];
    }
    
    // Don't load from localStorage to prevent filter persistence across categories
    return [0, 200000000];
  });

  // Add separate state for applied price range
  const [appliedPriceRange, setAppliedPriceRange] = useState<number[]>(() => {
    if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
      return initialFilters.priceRange as number[];
    }
    return [0, 200000000];
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    // Check if we have initialFilters with searchQuery
    if (initialFilters.searchQuery && typeof initialFilters.searchQuery === 'string') {
      console.log('Initializing search query from initialFilters:', initialFilters.searchQuery);
      return initialFilters.searchQuery;
    }
    
    // Don't load from localStorage to prevent filter persistence across categories
    return '';
  });

  // Add separate state for applied search query
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>(() => {
    if (initialFilters.searchQuery && typeof initialFilters.searchQuery === 'string') {
      return initialFilters.searchQuery;
    }
    return '';
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldAutoApply, setShouldAutoApply] = useState(false);
  const [hasInitialFiltersApplied, setHasInitialFiltersApplied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevTypeRef = useRef<string>(type);

  // Determine which filter to use based on type
  const getFilterDataForType = (type: string): any => {
    console.log('🎧 ProductFilter - Getting filter data for type:', type);
    
    // If type is an audio subtype, use the specific audio filter
    if (isAudioSubtype(type)) {
      const audioFilter = getAudioFilterData(type);
      console.log('🎵 Using audio-specific filter for:', type, 'Filter sections:', Object.keys(audioFilter));
      return audioFilter;
    }
    
    // Otherwise use the type directly from filterData
    const regularFilter = filterData[type] || {};
    console.log('📱 Using regular filter for:', type, 'Filter sections:', Object.keys(regularFilter));
    return regularFilter;
  };

  const currentFilterData = getFilterDataForType(type);

  // Effect to handle when initialFilters change (e.g., from URL navigation)
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0 && !hasInitialFiltersApplied) {
      console.log('Processing new initialFilters:', initialFilters);
      
      // Check if initialFilters are actually different from current state
      const currentState = {
        brand: selectedFilters.brand || [],
        tags: selectedFilters.tags || [],
        priceRange,
        searchQuery
      };
      
      const newState = {
        brand: initialFilters.brand || [],
        tags: initialFilters.tags || [],
        priceRange: initialFilters.priceRange || [0, 200000000],
        searchQuery: initialFilters.searchQuery || ''
      };
      
      // Compare states to avoid unnecessary updates
      const isDifferent = JSON.stringify(currentState) !== JSON.stringify(newState);
      
      if (!isDifferent) {
        console.log('InitialFilters are same as current state, skipping...');
        setHasInitialFiltersApplied(true);
        return;
      }
      
      const processedFilters: { [key: string]: string[] } = {};
      
      // Handle brand
      if (initialFilters.brand && Array.isArray(initialFilters.brand)) {
        processedFilters.brand = initialFilters.brand as string[];
      }
      
      // Handle tags
      if (initialFilters.tags && Array.isArray(initialFilters.tags)) {
        processedFilters.tags = initialFilters.tags as string[];
      }
      
      // Update all states first
      setSelectedFilters(processedFilters);
      setAppliedFilters(processedFilters); // Update applied filters too
      
      // Update priceRange if provided
      if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
        setPriceRange(initialFilters.priceRange as number[]);
        setAppliedPriceRange(initialFilters.priceRange as number[]);
      }
      
      // Update searchQuery if provided
      if (initialFilters.searchQuery && typeof initialFilters.searchQuery === 'string') {
        setSearchQuery(initialFilters.searchQuery);
        setAppliedSearchQuery(initialFilters.searchQuery);
      }
      
      // Mark as applied and trigger immediate auto-apply
      setHasInitialFiltersApplied(true);
      
      // Apply filters immediately
      console.log('Auto-applying initialFilters...');
      onApplyFilters({
        ...processedFilters,
        priceRange: initialFilters.priceRange || [0, 200000000],
        searchQuery: initialFilters.searchQuery || '',
      });
    }
  }, [initialFilters, hasInitialFiltersApplied, onApplyFilters, selectedFilters, priceRange, searchQuery]);

  // Auto-apply effect when shouldAutoApply flag is set
  useEffect(() => {
    if (shouldAutoApply) {
      // When auto-applying from filter removal, we need to send the current applied filters
      // that were already updated by handleRemoveFilter
      const filtersToSend = { ...appliedFilters };
      delete filtersToSend.price;
      
      onApplyFilters({
        ...filtersToSend,
        priceRange: appliedPriceRange,
        searchQuery: appliedSearchQuery,
      });
      
      setShouldAutoApply(false);
    }
  }, [appliedFilters, appliedPriceRange, appliedSearchQuery, shouldAutoApply, onApplyFilters]);

  // Calculate number of active filters based on applied filters
  const getSelectedFiltersCount = () => {
    const filtersCount = Object.values(appliedFilters).reduce((acc, curr) => acc + curr.length, 0);
    // Add 1 if applied price range is not default
    const hasPriceRange = appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 200000000;
    return filtersCount + (hasPriceRange ? 1 : 0);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilters({});
    setAppliedFilters({}); // Clear applied filters
    setPriceRange([0, 200000000]);
    setAppliedPriceRange([0, 200000000]); // Clear applied price range
    setSearchQuery('');
    setAppliedSearchQuery(''); // Clear applied search query
    setHasInitialFiltersApplied(false);
    
    // Reset sort when resetting all filters
    if (onSortReset) {
      onSortReset();
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY_FILTERS);
      localStorage.removeItem(STORAGE_KEY_PRICE_RANGE);
      localStorage.removeItem(STORAGE_KEY_SEARCH);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    // Apply empty filters to trigger data reload
    onApplyFilters({});
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: string, value: string, section?: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[key] || [];
      
      // Check if this is a price filter or a filter with multiSelect=false
      let filter: any = null;
      
      if (section && currentFilterData[section]) {
        // If section is provided, look for filter in specific section
        const filterSection = currentFilterData[section] as any[];
        filter = filterSection?.find((f: any) => f.key === key);
      } else {
        // Fallback to original logic if section not provided
        const filterSection = Object.values(currentFilterData).find((section: any) => 
          Array.isArray(section) && section.some((filter: any) => filter.key === key)
        ) as any[];
        filter = filterSection?.find((f: any) => f.key === key);
      }
      
      const isMultiSelect = filter?.multiSelect !== false;
      
      // Special handling for price filters - convert to priceRange
      if (key === 'price') {
        if (currentValues.includes(value)) {
          // Deselecting - reset to full range
          setPriceRange([0, 200000000]);
          return {
            ...prev,
            [key]: []
          };
        } else {
          // Selecting a price range - parse and update priceRange
          const [minStr, maxStr] = value.split('-');
          const min = minStr ? parseInt(minStr, 10) : 0;
          const max = maxStr ? parseInt(maxStr, 10) : 200000000;
          setPriceRange([min, max]);
          
          return {
            ...prev,
            [key]: [value]
          };
        }
      }
      
      // For other price filters or non-multiSelect filters, replace the current selection
      if (key === 'priceRanges' || !isMultiSelect) {
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [key]: []
          };
        } else {
          return {
            ...prev,
            [key]: [value]
          };
        }
      }
      
      // For other filters, toggle as before
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [key]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [key]: [...currentValues, value],
        };
      }
    });
  };

  // Handle removing filter and auto-apply - work with applied filters
  const handleRemoveFilter = (key: string, value: string) => {
    // Remove from applied filters directly
    setAppliedFilters((prev) => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.filter((v) => v !== value);
      
      const newAppliedFilters = {
        ...prev,
        [key]: newValues.length > 0 ? newValues : []
      };
      
      // If no values left for this key, remove the key entirely
      if (newValues.length === 0) {
        delete newAppliedFilters[key];
      }
      
      return newAppliedFilters;
    });
    
    // Also remove from selected filters to keep them in sync
    setSelectedFilters((prev) => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.filter((v) => v !== value);
      
      const newSelectedFilters = {
        ...prev,
        [key]: newValues.length > 0 ? newValues : []
      };
      
      if (newValues.length === 0) {
        delete newSelectedFilters[key];
      }
      
      return newSelectedFilters;
    });
    
    // Handle price range reset if it's a price filter
    if (key === 'price') {
      setPriceRange([0, 200000000]);
      setAppliedPriceRange([0, 200000000]);
    }
    
    // Reset sort when removing filter
    if (onSortReset) {
      onSortReset();
    }
    
    // Trigger auto-apply using flag instead of setTimeout
    setShouldAutoApply(true);
  };

  // Handle removing search query and auto-apply - work with applied search
  const handleRemoveSearchQuery = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    
    // Reset sort when removing search query
    if (onSortReset) {
      onSortReset();
    }
    
    // Trigger auto-apply using flag instead of setTimeout
    setShouldAutoApply(true);
  };

  const handlePriceRangeChange = (newValue: number[]) => {
    setPriceRange(newValue);
  };

  const handleApply = () => {
    // Check if we're in the middle of applying initialFilters
    if (!hasInitialFiltersApplied && Object.keys(initialFilters).length > 0) {
      console.log('Skipping manual apply - initialFilters are being processed');
      return;
    }
    
    // Update applied states to match current selected states
    setAppliedFilters(selectedFilters);
    setAppliedPriceRange(priceRange);
    setAppliedSearchQuery(searchQuery);
    
    // Remove price filter since we're using priceRange instead
    const filtersToSend = { ...selectedFilters };
    delete filtersToSend.price;
    
    // Send filter data to parent component
    onApplyFilters({
      ...filtersToSend,
      priceRange,
      searchQuery,
    });

    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Reset state when category changes (since we disabled localStorage)
  useEffect(() => {
    const prevType = prevTypeRef.current;
    
    if (prevType !== type) {
      console.log(`Category changed from ${prevType} to ${type}, resetting filters`);
      
      // Reset current state only if no initialFilters
      if (Object.keys(initialFilters).length === 0) {
        setSelectedFilters({});
        setAppliedFilters({}); // Reset applied filters
        setPriceRange([0, 200000000]);
        setAppliedPriceRange([0, 200000000]); // Reset applied price range
        setSearchQuery('');
        setAppliedSearchQuery(''); // Reset applied search query
        setHasInitialFiltersApplied(false);
        
        // Also trigger onApplyFilters to clear filters on backend
        onApplyFilters({
          priceRange: [0, 200000000],
          searchQuery: '',
        });
      }
      
      // Update ref to current type
      prevTypeRef.current = type;
    }
  }, [type, initialFilters, onApplyFilters]);

  if (isLoading) {
    return <FilterSkeleton />;
  }

  return (
    <div className="p-4">
      {/* Filter Button and Dropdown */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            disabled={isLoading}
          >
            <span>Lọc</span>
            {(getSelectedFiltersCount() > 0 || appliedSearchQuery.trim()) && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs">
                {getSelectedFiltersCount() + (appliedSearchQuery.trim() ? 1 : 0)}
              </span>
            )}
            <svg
              className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <FilterDropdown
              currentFilterData={currentFilterData}
              selectedFilters={selectedFilters}
              priceRange={priceRange}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onSearchQueryChange={setSearchQuery}
              onApply={handleApply}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Reset Button and Active Filters */}
      {(getSelectedFiltersCount() > 0 || appliedSearchQuery.trim()) && (
        <div className="mb-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Active filters display - use applied filters */}
      {getSelectedFiltersCount() > 0 && (
        <ActiveFilters
          selectedFilters={appliedFilters}
          currentFilterData={currentFilterData}
          onRemoveFilter={handleRemoveFilter}
        />
      )}

      {/* Show search query as active filter if present - use applied search query */}
      {appliedSearchQuery.trim() && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              Tìm kiếm: "{appliedSearchQuery}"
              <button
                onClick={handleRemoveSearchQuery}
                className="ml-1 text-green-600 hover:text-green-800"
                aria-label="Remove search"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Show applied price range as active filter if it's not default range */}
      {(appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 200000000) && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              {appliedPriceRange[0] === appliedPriceRange[1]
                ? `Giá: ${appliedPriceRange[0].toLocaleString('vi-VN')}đ`
                : `Giá: ${appliedPriceRange[0].toLocaleString('vi-VN')}đ - ${appliedPriceRange[1].toLocaleString('vi-VN')}đ`}
              <button
                onClick={() => {
                  setPriceRange([0, 200000000]);
                  setAppliedPriceRange([0, 200000000]);
                  
                  // Reset sort when removing price range
                  if (onSortReset) {
                    onSortReset();
                  }
                  
                  // Trigger auto-apply
                  setShouldAutoApply(true);
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="Remove price range"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Sort Menu */}
      <SortMenu
        sortByPrice={sortByPrice}
        onSortChange={onSortChange}
        isLoading={isLoading}
      />
    </div>
  );
};

=======
import React, { useState, useRef, useEffect } from 'react';
import FilterDropdown from './FilterDropdown';
import SortMenu from './SortMenu';
import ActiveFilters from './ActiveFilters';
import FilterSkeleton from './FilterSkeleton';
import { filterData } from '../../types/datafilter';
import { isAudioSubtype, getAudioFilterData } from '../../utils/audioFilterHelper';

interface ProductFilterProps {
  type: string;
  onApplyFilters: (filters: { [key: string]: string[] | number[] | string }) => void;
  onSortChange: (sortOrder: string) => void;
  onSortReset?: () => void; // Callback để reset sort khi xóa filter
  sortByPrice: string;
  isLoading?: boolean;
  initialFilters?: { [key: string]: string[] | number[] | string }; // Thêm prop này
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  type,
  onApplyFilters,
  onSortChange,
  onSortReset,
  sortByPrice,
  isLoading = false,
  initialFilters = {}, // Default empty object
}) => {
  // Storage keys for persisting state
  const STORAGE_KEY_FILTERS = `productFilters_${type}`;
  const STORAGE_KEY_PRICE_RANGE = `priceRange_${type}`;
  const STORAGE_KEY_SEARCH = `searchQuery_${type}`;

  // Initialize state with initialFilters taking priority over localStorage
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>(() => {
    // Check if we have initialFilters from URL/chatbot
    if (Object.keys(initialFilters).length > 0) {
      console.log('Initializing filters from initialFilters:', initialFilters);
      
      const processedFilters: { [key: string]: string[] } = {};
      
      // Handle brand
      if (initialFilters.brand && Array.isArray(initialFilters.brand)) {
        processedFilters.brand = initialFilters.brand as string[];
      }
      
      // Handle tags
      if (initialFilters.tags && Array.isArray(initialFilters.tags)) {
        processedFilters.tags = initialFilters.tags as string[];
      }
      
      return processedFilters;
    }
    
    // Don't load from localStorage to prevent filter persistence across categories
    return {};
  });

  // Add separate state for applied filters - only these will show as tags
  const [appliedFilters, setAppliedFilters] = useState<{ [key: string]: string[] }>(() => {
    // Initialize with initialFilters if available
    if (Object.keys(initialFilters).length > 0) {
      const processedFilters: { [key: string]: string[] } = {};
      
      // Handle brand
      if (initialFilters.brand && Array.isArray(initialFilters.brand)) {
        processedFilters.brand = initialFilters.brand as string[];
      }
      
      // Handle tags
      if (initialFilters.tags && Array.isArray(initialFilters.tags)) {
        processedFilters.tags = initialFilters.tags as string[];
      }
      
      return processedFilters;
    }
    
    return {};
  });

  const [priceRange, setPriceRange] = useState<number[]>(() => {
    // Check if we have initialFilters with priceRange
    if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
      console.log('Initializing price range from initialFilters:', initialFilters.priceRange);
      return initialFilters.priceRange as number[];
    }
    
    // Don't load from localStorage to prevent filter persistence across categories
    return [0, 200000000];
  });

  // Add separate state for applied price range
  const [appliedPriceRange, setAppliedPriceRange] = useState<number[]>(() => {
    if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
      return initialFilters.priceRange as number[];
    }
    return [0, 200000000];
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    // Check if we have initialFilters with searchQuery
    if (initialFilters.searchQuery && typeof initialFilters.searchQuery === 'string') {
      console.log('Initializing search query from initialFilters:', initialFilters.searchQuery);
      return initialFilters.searchQuery;
    }
    
    // Don't load from localStorage to prevent filter persistence across categories
    return '';
  });

  // Add separate state for applied search query
  const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>(() => {
    if (initialFilters.searchQuery && typeof initialFilters.searchQuery === 'string') {
      return initialFilters.searchQuery;
    }
    return '';
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldAutoApply, setShouldAutoApply] = useState(false);
  const [hasInitialFiltersApplied, setHasInitialFiltersApplied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevTypeRef = useRef<string>(type);

  // Determine which filter to use based on type
  const getFilterDataForType = (type: string): any => {
    console.log('🎧 ProductFilter - Getting filter data for type:', type);
    
    // If type is an audio subtype, use the specific audio filter
    if (isAudioSubtype(type)) {
      const audioFilter = getAudioFilterData(type);
      console.log('🎵 Using audio-specific filter for:', type, 'Filter sections:', Object.keys(audioFilter));
      return audioFilter;
    }
    
    // If type is backup_charger, use its specific filter data
    if (type === 'backup_charger') {
      const backupChargerFilter = filterData['backup_charger'] || {};
      console.log('🔋 Using backup_charger-specific filter for:', type, 'Filter sections:', Object.keys(backupChargerFilter));
      return backupChargerFilter;
    }
    
    // Otherwise use the type directly from filterData
    const regularFilter = filterData[type] || {};
    console.log('📱 Using regular filter for:', type, 'Filter sections:', Object.keys(regularFilter));
    return regularFilter;
  };

  const currentFilterData = getFilterDataForType(type);

  // Effect to handle when initialFilters change (e.g., from URL navigation)
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0 && !hasInitialFiltersApplied) {
      console.log('Processing new initialFilters:', initialFilters);
      
      // Check if initialFilters are actually different from current state
      const currentState = {
        brand: selectedFilters.brand || [],
        tags: selectedFilters.tags || [],
        priceRange,
        searchQuery
      };
      
      const newState = {
        brand: initialFilters.brand || [],
        tags: initialFilters.tags || [],
        priceRange: initialFilters.priceRange || [0, 200000000],
        searchQuery: initialFilters.searchQuery || ''
      };
      
      // Compare states to avoid unnecessary updates
      const isDifferent = JSON.stringify(currentState) !== JSON.stringify(newState);
      
      if (!isDifferent) {
        console.log('InitialFilters are same as current state, skipping...');
        setHasInitialFiltersApplied(true);
        return;
      }
      
      const processedFilters: { [key: string]: string[] } = {};
      
      // Handle brand
      if (initialFilters.brand && Array.isArray(initialFilters.brand)) {
        processedFilters.brand = initialFilters.brand as string[];
      }
      
      // Handle tags
      if (initialFilters.tags && Array.isArray(initialFilters.tags)) {
        processedFilters.tags = initialFilters.tags as string[];
      }
      
      // Update all states first
      setSelectedFilters(processedFilters);
      setAppliedFilters(processedFilters); // Update applied filters too
      
      // Update priceRange if provided
      if (initialFilters.priceRange && Array.isArray(initialFilters.priceRange)) {
        setPriceRange(initialFilters.priceRange as number[]);
        setAppliedPriceRange(initialFilters.priceRange as number[]);
      }
      
      // Update searchQuery if provided
      if (initialFilters.searchQuery && typeof initialFilters.searchQuery === 'string') {
        setSearchQuery(initialFilters.searchQuery);
        setAppliedSearchQuery(initialFilters.searchQuery);
      }
      
      // Mark as applied and trigger immediate auto-apply
      setHasInitialFiltersApplied(true);
      
      // Apply filters immediately
      console.log('Auto-applying initialFilters...');
      onApplyFilters({
        ...processedFilters,
        priceRange: initialFilters.priceRange || [0, 200000000],
        searchQuery: initialFilters.searchQuery || '',
      });
    }
  }, [initialFilters, hasInitialFiltersApplied, onApplyFilters, selectedFilters, priceRange, searchQuery]);

  // Auto-apply effect when shouldAutoApply flag is set
  useEffect(() => {
    if (shouldAutoApply) {
      // When auto-applying from filter removal, we need to send the current applied filters
      // that were already updated by handleRemoveFilter
      const filtersToSend = { ...appliedFilters };
      delete filtersToSend.price;
      
      onApplyFilters({
        ...filtersToSend,
        priceRange: appliedPriceRange,
        searchQuery: appliedSearchQuery,
      });
      
      setShouldAutoApply(false);
    }
  }, [appliedFilters, appliedPriceRange, appliedSearchQuery, shouldAutoApply, onApplyFilters]);

  // Calculate number of active filters based on applied filters
  const getSelectedFiltersCount = () => {
    const filtersCount = Object.values(appliedFilters).reduce((acc, curr) => acc + curr.length, 0);
    // Add 1 if applied price range is not default
    const hasPriceRange = appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 200000000;
    return filtersCount + (hasPriceRange ? 1 : 0);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilters({});
    setAppliedFilters({}); // Clear applied filters
    setPriceRange([0, 200000000]);
    setAppliedPriceRange([0, 200000000]); // Clear applied price range
    setSearchQuery('');
    setAppliedSearchQuery(''); // Clear applied search query
    setHasInitialFiltersApplied(false);
    
    // Reset sort when resetting all filters
    if (onSortReset) {
      onSortReset();
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY_FILTERS);
      localStorage.removeItem(STORAGE_KEY_PRICE_RANGE);
      localStorage.removeItem(STORAGE_KEY_SEARCH);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    // Apply empty filters to trigger data reload
    onApplyFilters({});
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: string, value: string, section?: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[key] || [];
      
      // Check if this is a price filter or a filter with multiSelect=false
      let filter: any = null;
      
      if (section && currentFilterData[section]) {
        // If section is provided, look for filter in specific section
        const filterSection = currentFilterData[section] as any[];
        filter = filterSection?.find((f: any) => f.key === key);
      } else {
        // Fallback to original logic if section not provided
        const filterSection = Object.values(currentFilterData).find((section: any) => 
          Array.isArray(section) && section.some((filter: any) => filter.key === key)
        ) as any[];
        filter = filterSection?.find((f: any) => f.key === key);
      }
      
      const isMultiSelect = filter?.multiSelect !== false;
      
      // Special handling for price filters - convert to priceRange
      if (key === 'price') {
        if (currentValues.includes(value)) {
          // Deselecting - reset to full range
          setPriceRange([0, 200000000]);
          return {
            ...prev,
            [key]: []
          };
        } else {
          // Selecting a price range - parse and update priceRange
          const [minStr, maxStr] = value.split('-');
          const min = minStr ? parseInt(minStr, 10) : 0;
          const max = maxStr ? parseInt(maxStr, 10) : 200000000;
          setPriceRange([min, max]);
          
          return {
            ...prev,
            [key]: [value]
          };
        }
      }
      
      // For other price filters or non-multiSelect filters, replace the current selection
      if (key === 'priceRanges' || !isMultiSelect) {
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [key]: []
          };
        } else {
          return {
            ...prev,
            [key]: [value]
          };
        }
      }
      
      // For other filters, toggle as before
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [key]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [key]: [...currentValues, value],
        };
      }
    });
  };

  // Handle removing filter and auto-apply - work with applied filters
  const handleRemoveFilter = (key: string, value: string) => {
    // Remove from applied filters directly
    setAppliedFilters((prev) => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.filter((v) => v !== value);
      
      const newAppliedFilters = {
        ...prev,
        [key]: newValues.length > 0 ? newValues : []
      };
      
      // If no values left for this key, remove the key entirely
      if (newValues.length === 0) {
        delete newAppliedFilters[key];
      }
      
      return newAppliedFilters;
    });
    
    // Also remove from selected filters to keep them in sync
    setSelectedFilters((prev) => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.filter((v) => v !== value);
      
      const newSelectedFilters = {
        ...prev,
        [key]: newValues.length > 0 ? newValues : []
      };
      
      if (newValues.length === 0) {
        delete newSelectedFilters[key];
      }
      
      return newSelectedFilters;
    });
    
    // Handle price range reset if it's a price filter
    if (key === 'price') {
      setPriceRange([0, 200000000]);
      setAppliedPriceRange([0, 200000000]);
    }
    
    // Reset sort when removing filter
    if (onSortReset) {
      onSortReset();
    }
    
    // Trigger auto-apply using flag instead of setTimeout
    setShouldAutoApply(true);
  };

  // Handle removing search query and auto-apply - work with applied search
  const handleRemoveSearchQuery = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    
    // Reset sort when removing search query
    if (onSortReset) {
      onSortReset();
    }
    
    // Trigger auto-apply using flag instead of setTimeout
    setShouldAutoApply(true);
  };

  const handlePriceRangeChange = (newValue: number[]) => {
    setPriceRange(newValue);
  };

  const handleApply = () => {
    // Check if we're in the middle of applying initialFilters
    if (!hasInitialFiltersApplied && Object.keys(initialFilters).length > 0) {
      console.log('Skipping manual apply - initialFilters are being processed');
      return;
    }
    
    // Update applied states to match current selected states
    setAppliedFilters(selectedFilters);
    setAppliedPriceRange(priceRange);
    setAppliedSearchQuery(searchQuery);
    
    // Remove price filter since we're using priceRange instead
    const filtersToSend = { ...selectedFilters };
    delete filtersToSend.price;
    
    // Send filter data to parent component
    onApplyFilters({
      ...filtersToSend,
      priceRange,
      searchQuery,
    });

    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Reset state when category changes (since we disabled localStorage)
  useEffect(() => {
    const prevType = prevTypeRef.current;
    
    if (prevType !== type) {
      console.log(`Category changed from ${prevType} to ${type}, resetting filters`);
      
      // Reset current state only if no initialFilters
      if (Object.keys(initialFilters).length === 0) {
        setSelectedFilters({});
        setAppliedFilters({}); // Reset applied filters
        setPriceRange([0, 200000000]);
        setAppliedPriceRange([0, 200000000]); // Reset applied price range
        setSearchQuery('');
        setAppliedSearchQuery(''); // Reset applied search query
        setHasInitialFiltersApplied(false);
        
        // Also trigger onApplyFilters to clear filters on backend
        onApplyFilters({
          priceRange: [0, 200000000],
          searchQuery: '',
        });
      }
      
      // Update ref to current type
      prevTypeRef.current = type;
    }
  }, [type, initialFilters, onApplyFilters]);

  if (isLoading) {
    return <FilterSkeleton />;
  }

  return (
    <div className="p-4">
      {/* Filter Button and Dropdown */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            disabled={isLoading}
          >
            <span>Lọc</span>
            {(getSelectedFiltersCount() > 0 || appliedSearchQuery.trim()) && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs">
                {getSelectedFiltersCount() + (appliedSearchQuery.trim() ? 1 : 0)}
              </span>
            )}
            <svg
              className={`w-4 h-4 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <FilterDropdown
              currentFilterData={currentFilterData}
              selectedFilters={selectedFilters}
              priceRange={priceRange}
              searchQuery={searchQuery}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onSearchQueryChange={setSearchQuery}
              onApply={handleApply}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Reset Button and Active Filters */}
      {(getSelectedFiltersCount() > 0 || appliedSearchQuery.trim()) && (
        <div className="mb-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Active filters display - use applied filters */}
      {getSelectedFiltersCount() > 0 && (
        <ActiveFilters
          selectedFilters={appliedFilters}
          currentFilterData={currentFilterData}
          onRemoveFilter={handleRemoveFilter}
        />
      )}

      {/* Show search query as active filter if present - use applied search query */}
      {appliedSearchQuery.trim() && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              Tìm kiếm: "{appliedSearchQuery}"
              <button
                onClick={handleRemoveSearchQuery}
                className="ml-1 text-green-600 hover:text-green-800"
                aria-label="Remove search"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Show applied price range as active filter if it's not default range */}
      {(appliedPriceRange[0] !== 0 || appliedPriceRange[1] !== 200000000) && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
              {appliedPriceRange[0] === appliedPriceRange[1]
                ? `Giá: ${appliedPriceRange[0].toLocaleString('vi-VN')}đ`
                : `Giá: ${appliedPriceRange[0].toLocaleString('vi-VN')}đ - ${appliedPriceRange[1].toLocaleString('vi-VN')}đ`}
              <button
                onClick={() => {
                  setPriceRange([0, 200000000]);
                  setAppliedPriceRange([0, 200000000]);
                  
                  // Reset sort when removing price range
                  if (onSortReset) {
                    onSortReset();
                  }
                  
                  // Trigger auto-apply
                  setShouldAutoApply(true);
                }}
                className="ml-1 text-blue-600 hover:text-blue-800"
                aria-label="Remove price range"
              >
                ×
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Sort Menu */}
      <SortMenu
        sortByPrice={sortByPrice}
        onSortChange={onSortChange}
        isLoading={isLoading}
      />
    </div>
  );
};

>>>>>>> server
export default ProductFilter;