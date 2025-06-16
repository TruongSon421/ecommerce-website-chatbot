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
  phone: [
    { min: 0, max: 2000000, label: 'Dưới 2 triệu' },
    { min: 2000000, max: 4000000, label: 'Từ 2 - 4 triệu' },
    { min: 4000000, max: 7000000, label: 'Từ 4 - 7 triệu' },
    { min: 7000000, max: 13000000, label: 'Từ 7 - 13 triệu' },
    { min: 13000000, max: 20000000, label: 'Từ 13 - 20 triệu' },
    { min: 20000000, max: null, label: 'Trên 20 triệu' }
  ],
  laptop: [
    { min: 0, max: 10000000, label: 'Dưới 10 triệu' },
    { min: 10000000, max: 15000000, label: 'Từ 10 - 15 triệu' },
    { min: 15000000, max: 20000000, label: 'Từ 15 - 20 triệu' },
    { min: 20000000, max: 30000000, label: 'Từ 20 - 30 triệu' },
    { min: 30000000, max: null, label: 'Trên 30 triệu' }
  ],
  audio: [
    { min: 0, max: 500000, label: 'Dưới 500 nghìn' },
    { min: 500000, max: 1000000, label: 'Từ 500k - 1 triệu' },
    { min: 1000000, max: 2000000, label: 'Từ 1 - 2 triệu' },
    { min: 2000000, max: 5000000, label: 'Từ 2 - 5 triệu' },
    { min: 5000000, max: 10000000, label: 'Từ 5 - 10 triệu' },
    { min: 10000000, max: null, label: 'Trên 10 triệu' }
  ],
  phukien: [
    { min: 0, max: 200000, label: 'Dưới 200 nghìn' },
    { min: 200000, max: 500000, label: 'Từ 200k - 500k' },
    { min: 500000, max: 1000000, label: 'Từ 500k - 1 triệu' },
    { min: 1000000, max: 2000000, label: 'Từ 1 - 2 triệu' },
    { min: 2000000, max: 5000000, label: 'Từ 2 - 5 triệu' },
    { min: 5000000, max: null, label: 'Trên 5 triệu' }
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
        { label: 'Samsung', value: 'Samsung' },
        { label: 'iPhone', value: 'iPhone (Apple)' },
        { label: 'OPPO', value: 'OPPO' },
        { label: 'Xiaomi', value: 'Xiaomi' },
        { label: 'vivo', value: 'vivo' },
        { label: 'realme', value: 'realme' },
        { label: 'HONOR', value: 'HONOR' },
        { label: 'Nokia', value: 'Nokia' },
        { label: 'Masstel', value: 'Masstel' },
        { label: 'Mobell', value: 'Mobell' },
        { label: 'Itel', value: 'Itel' },
      ]
    }
  ],
  priceRanges: [
    {
      key: 'price',
      label: 'Giá',
      multiSelect: false,
      options: PRICE_RANGES.phone.map(range => ({
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
  phone: phoneFilterData,
  laptop: {
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
        options: PRICE_RANGES.laptop.map(range => ({
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
  },
  audio: {
    brands: [
      {
        key: 'brand',
        label: 'Hãng',
        isSearchable: true,
        multiSelect: true,
        options: [
          { label: 'Sony', value: 'Sony' },
          { label: 'JBL', value: 'JBL' },
          { label: 'Bose', value: 'Bose' },
          { label: 'Apple', value: 'Apple' },
          { label: 'Samsung', value: 'Samsung' },
          { label: 'Sennheiser', value: 'Sennheiser' },
          { label: 'Audio-Technica', value: 'Audio-Technica' },
          { label: 'Beats', value: 'Beats' },
          { label: 'Xiaomi', value: 'Xiaomi' },
          { label: 'Anker', value: 'Anker' },
          { label: 'Marshall', value: 'Marshall' },
          { label: 'Edifier', value: 'Edifier' }
        ]
      }
    ],
    priceRanges: [
      {
        key: 'price',
        label: 'Giá',
        multiSelect: false,
        options: PRICE_RANGES.audio.map(range => ({
          label: range.label,
          value: `${range.min}-${range.max || ''}`
        }))
      }
    ],
    connectivity: [
      {
        key: 'tags',
        label: 'Kết nối',
        multiSelect: false,
        options: [
          { label: 'Bluetooth 5.0+', value: 'bluetooth_5' },
          { label: 'USB-C', value: 'usb_c' },
          { label: 'Jack 3.5mm', value: 'jack_3_5mm' },
          { label: 'Wireless', value: 'wireless' },
          { label: 'Lightning', value: 'lightning' }
        ]
      }
    ],
    earphoneTechnology: [
      {
        key: 'tags',
        label: 'Công nghệ dẫn truyền',
        multiSelect: false,
        options: [
          { label: 'Dẫn truyền qua xương', value: 'earHeadphone_tech_boneConduction' },
          { label: 'Dẫn truyền qua khí', value: 'earHeadphone_tech_airConduction' }
        ]
      }
    ],
    earphoneBattery: [
      {
        key: 'tags',
        label: 'Thời lượng pin tai nghe',
        multiSelect: false,
        options: [
          { label: 'Dưới 4 tiếng', value: 'earHeadphone_battery_under4' },
          { label: 'Từ 4 đến 6 tiếng', value: 'earHeadphone_battery_4to6' },
          { label: 'Từ 6 đến 8 tiếng', value: 'earHeadphone_battery_6to8' },
          { label: 'Trên 8 tiếng', value: 'earHeadphone_battery_above8' }
        ]
      }
    ],
    earphoneBenefits: [
      {
        key: 'tags',
        label: 'Tiện ích tai nghe',
        multiSelect: true,
        options: [
          { label: 'Sạc không dây', value: 'earHeadphone_benefit_wirelessCharge' },
          { label: 'Chống nước', value: 'earHeadphone_benefit_waterProof' },
          { label: 'Mic đàm thoại', value: 'earHeadphone_benefit_mic' },
          { label: 'Chống ồn ANC', value: 'earHeadphone_benefit_anc' },
          { label: 'Chống ồn ENC', value: 'earHeadphone_benefit_enc' }
        ]
      }
    ]
  },
  phukien: {
    brands: [
      {
        key: 'brand',
        label: 'Hãng',
        isSearchable: true,
        multiSelect: true,
        options: [
          { label: 'Anker', value: 'Anker' },
          { label: 'Samsung', value: 'Samsung' },
          { label: 'Xiaomi', value: 'Xiaomi' },
          { label: 'Baseus', value: 'Baseus' },
          { label: 'UGREEN', value: 'UGREEN' },
          { label: 'Aukey', value: 'Aukey' },
          { label: 'RAVPower', value: 'RAVPower' },
          { label: 'Romoss', value: 'Romoss' },
          { label: 'Pisen', value: 'Pisen' },
          { label: 'Remax', value: 'Remax' },
          { label: 'Belkin', value: 'Belkin' },
          { label: 'Energizer', value: 'Energizer' }
        ]
      }
    ],
    priceRanges: [
      {
        key: 'price',
        label: 'Giá',
        multiSelect: false,
        options: PRICE_RANGES.phukien.map(range => ({
          label: range.label,
          value: `${range.min}-${range.max || ''}`
        }))
      }
    ],
    backupChargerType: [
      {
        key: 'tags',
        label: 'Loại sạc dự phòng',
        multiSelect: false,
        options: [
          { label: 'Mỏng nhẹ', value: 'backupCharger_type_smallLight' },
          { label: 'Cho laptop', value: 'backupCharger_tech_forLaptop' }
        ]
      }
    ],
    backupChargerBattery: [
      {
        key: 'tags',
        label: 'Dung lượng pin sạc dự phòng',
        multiSelect: false,
        options: [
          { label: '10.000 mAh', value: 'backupCharger_battery_10k' },
          { label: '20.000 mAh', value: 'backupCharger_battery_20k' },
          { label: 'Trên 20.000 mAh', value: 'backupCharger_battery_above20k' }
        ]
      }
    ],
    backupChargerBenefits: [
      {
        key: 'tags',
        label: 'Tiện ích sạc dự phòng',
        multiSelect: true,
        options: [
          { label: 'Sạc không dây', value: 'backupCharger_benefit_wirelessCharge' },
          { label: 'Sạc nhanh', value: 'backupCharger_benefit_fastCharge' },
          { label: 'Magsafe/Magnetic', value: 'backupCharger_benefit_magesafe' }
        ]
      }
    ]
  }
};