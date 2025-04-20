// src/types/datafilter.ts
export interface FilterOption {
  label: string;
  value: string;
  count?: number; // Số lượng sản phẩm cho mỗi option
}

export interface Filter {
  key: string;
  label: string;
  options: FilterOption[];
  isSearchable?: boolean; // Cho phép tìm kiếm trong options
  multiSelect?: boolean; // Cho phép chọn nhiều
}

export interface PriceRange {
  min: number;
  max: number | null;
  label: string;
}

export interface FilterData {
  [key: string]: Filter[];
}

export interface AllFilterData {
  [key: string]: FilterData;
}

// Export price ranges as a constant
export const PRICE_RANGES = {
  PHONE: [
    { min: 0, max: 2000000, label: 'Dưới 2 triệu' },
    { min: 2000000, max: 4000000, label: 'Từ 2 - 4 triệu' },
    { min: 4000000, max: 7000000, label: 'Từ 4 - 7 triệu' },
    { min: 7000000, max: 13000000, label: 'Từ 7 - 13 triệu' },
    { min: 13000000, max: 20000000, label: 'Từ 13 - 20 triệu' },
    { min: 20000000, max: null, label: 'Trên 20 triệu' }
  ],
  LAPTOP: [
    { min: 0, max: 10000000, label: 'Dưới 10 triệu' },
    { min: 10000000, max: 15000000, label: 'Từ 10 - 15 triệu' },
    { min: 15000000, max: 20000000, label: 'Từ 15 - 20 triệu' },
    { min: 20000000, max: 30000000, label: 'Từ 20 - 30 triệu' },
    { min: 30000000, max: null, label: 'Trên 30 triệu' }
  ]
} as const;

// Phone Filters
export const phoneFilterData: FilterData = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'Samsung', value: 'samsung' },
        { label: 'iPhone', value: 'iphone' },
        { label: 'OPPO', value: 'oppo' },
        { label: 'Xiaomi', value: 'xiaomi' },
        { label: 'vivo', value: 'vivo' },
        { label: 'realme', value: 'realme' },
        { label: 'HONOR', value: 'honor' },
        { label: 'TCL', value: 'tcl' },
        { label: 'TECNO', value: 'tecno' },
        { label: 'Nokia', value: 'nokia' },
        { label: 'Masstel', value: 'masstel' },
        { label: 'mobell', value: 'mobell' },
        { label: 'itel', value: 'itel' },
        { label: 'viettel', value: 'viettel' },
        { label: 'benco', value: 'benco' }
      ]
    }
  ],
  priceRanges: [
    {
      key: 'price',
      label: 'Giá',
      multiSelect: false,
      options: PRICE_RANGES.PHONE.map(range => ({
        label: range.label,
        value: `${range.min}-${range.max || ''}`
      }))
    }
  ],
  needs: [
    {
      key: 'tags',
      label: 'Nhu cầu',
      multiSelect: true,
      options: [
        { label: 'Chơi game / Cấu hình cao', value: 'phone_highSpecs' },
        { label: 'Pin khủng trên 5000 mAh', value: 'phone_battery' },
        { label: 'Chụp ảnh, quay phim', value: 'phone_camera' },
        { label: 'Livestream', value: 'phone_livestream' },
        { label: 'Mỏng nhẹ', value: 'phone_slimLight' }
      ]
    }
  ]
};

// Helper functions
export const getFilterLabel = (type: string, filterKey: string, value: string): string => {
  const filters = filterData[type]?.[filterKey] || [];
  const filter = filters.find(f => f.key === filterKey);
  return filter?.options.find(opt => opt.value === value)?.label || value;
};

export const getPriceRange = (type: string, value: string): PriceRange => {
  const [min = 0, max = ''] = value.split('-');
  return { 
    min: Number(min), 
    max: max ? Number(max) : null, 
    label: getFilterLabel(type, 'priceRanges', value) 
  };
};

// Main export
export const filterData: AllFilterData = {
  PHONE: phoneFilterData,
  LAPTOP: {
    brands: [
      {
        key: 'brand',
        label: 'Hãng',
        isSearchable: true,
        multiSelect: true,
        options: [
          { label: 'Dell', value: 'dell' },
          { label: 'HP', value: 'hp' },
          { label: 'Lenovo', value: 'lenovo' },
          { label: 'Asus', value: 'asus' },
          { label: 'Acer', value: 'acer' },
          { label: 'MSI', value: 'msi' },
          { label: 'MacBook', value: 'macbook' }
        ]
      }
    ],
    priceRanges: [
      {
        key: 'price',
        label: 'Giá',
        multiSelect: false,
        options: PRICE_RANGES.LAPTOP.map(range => ({
          label: range.label,
          value: `${range.min}-${range.max || ''}`
        }))
      }
    ],
    needs: [
      {
        key: 'tags',
        label: 'Nhu cầu',
        multiSelect: true,
        options: [
          { label: 'Chơi game / Cấu hình cao', value: 'laptop_gaming' },
          { label: 'Học tập - Văn phòng', value: 'laptop_office' },
          { label: 'Đồ họa - Kỹ thuật', value: 'laptop_design' },
          { label: 'Mỏng nhẹ', value: 'laptop_slimLight' }
        ]
      }
    ],
    ram: [
      {
        key: 'ram',
        label: 'RAM',
        multiSelect: true,
        options: [
          { label: '8GB', value: '8' },
          { label: '16GB', value: '16' },
          { label: '32GB', value: '32' }
        ]
      }
    ],
    cpu: [
      {
        key: 'cpu',
        label: 'CPU',
        multiSelect: true,
        options: [
          { label: 'Intel i3', value: 'intel_i3' },
          { label: 'Intel i5', value: 'intel_i5' },
          { label: 'Intel i7', value: 'intel_i7' },
          { label: 'AMD Ryzen 5', value: 'amd_ryzen5' },
          { label: 'AMD Ryzen 7', value: 'amd_ryzen7' }
        ]
      }
    ],
    storage: [
      {
        key: 'storage',
        label: 'Ổ cứng',
        multiSelect: true,
        options: [
          { label: '256GB SSD', value: '256_ssd' },
          { label: '512GB SSD', value: '512_ssd' },
          { label: '1TB SSD', value: '1tb_ssd' }
        ]
      }
    ]
  }
};