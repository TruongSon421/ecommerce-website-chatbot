// src/types/datafilter.ts - Updated version
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

export interface FilterData {
  [key: string]: Filter[];
}

export interface AllFilterData {
  [key: string]: FilterData;
}

export interface PriceRange {
  min: number;
  max: number | null;
  label: string;
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

// Phone Filters - Updated to use 'tags' key consistently
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
        { label: 'Mỏng nhẹ', value: 'phone_slimLight' },
      ]
    }
  ],
  specialFeatures: [
    {
      key: 'tags',
      label: 'Tính năng đặc biệt',
      multiSelect: true,
      options: [
        { label: 'Hỗ trợ 5G', value: 'phone_specialFeature_5g' },
        { label: 'Chỉnh sửa ảnh AI', value: 'phone_specialFeature_aiEdit' },
        { label: 'Kháng nước, bụi', value: 'phone_specialFeature_waterDustProof' }
      ]
    }
  ],
  chargeFeatures: [
    {
      key: 'tags',
      label: 'Tính năng sạc',
      multiSelect: true,
      options: [
        { label: 'Sạc nhanh (từ 20W)', value: 'phone_charge_fastCharge20' },
        { label: 'Sạc siêu nhanh (từ 60W)', value: 'phone_charge_superFastCharge60' },
        { label: 'Sạc không dây', value: 'phone_charge_wirelessCharge' }
      ]
    }
  ]
};

// Laptop Filters - Updated structure
export const laptopFilterData: FilterData = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'Dell', value: 'Dell' },
        { label: 'HP', value: 'HP' },
        { label: 'Lenovo', value: 'Lenovo' },
        { label: 'Asus', value: 'Asus' },
        { label: 'Acer', value: 'Acer' },
        { label: 'MSI', value: 'MSI' },
        { label: 'MacBook', value: 'MacBook,Apple' }
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
  screen: [
    {
      key: 'tags',
      label: 'Kích thước màn hình',
      multiSelect: true,
      options: [
        { label: 'Khoảng 13 inch', value: 'laptop_screen_13inch' },
        { label: 'Khoảng 14 inch', value: 'laptop_screen_14inch' },
        { label: 'Khoảng 15 inch', value: 'laptop_screen_15inch' },
        { label: 'Trên 16 inch', value: 'laptop_screen_16inch' },
      ]
    }
  ],
  specialFeatures: [
    {
      key: 'tags',
      label: 'Tính năng đặc biệt',
      multiSelect: true,
      options: [
        { label: 'Cảm ứng', value: 'laptop_specialFeature_touchScreen' },
        { label: 'Màn hình OLED', value: 'laptop_specialFeature_oled' },
        { label: 'Chống chói', value: 'laptop_specialFeature_antiGlare' },
        { label: 'Gập 360 độ', value: 'laptop_specialFeature_360' },
      ]
    }
  ]
};

// Wired Earphone Filters (Tai nghe có dây)
export const wiredEarphoneFilterData: FilterData = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'JBL', value: 'JBL' },
        { label: 'Xiaomi', value: 'Xiaomi' },
        { label: 'Baseus', value: 'Baseus' },
        { label: 'OPPO', value: 'OPPO' },
        { label: 'HP HyperX', value: 'HP HyperX' },
        { label: 'Sony', value: 'Sony' },
        { label: 'Asus', value: 'Asus' },
        { label: 'Apple', value: 'Apple' },
        { label: 'AVA+', value: 'AVA+' },
        { label: 'Samsung', value: 'Samsung' },       
        
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
  earphoneBenefits: [
    {
      key: 'tags',
      label: 'Tiện ích',
      multiSelect: true,
      options: [
        { label: 'Mic đàm thoại', value: 'earHeadphone_benefit_mic' },
      ]
    }
  ]
};

// Wireless Earphone Filters (Tai nghe không dây)
export const wirelessEarphoneFilterData: FilterData = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'Apple', value: 'Apple' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Sony', value: 'Sony' },
        { label: 'JBL', value: 'JBL' },
        { label: 'Beats', value: 'Beats' },
        { label: 'Marshall', value: 'Marshall' },
        { label: 'Xiaomi', value: 'Xiaomi' },
        { label: 'OPPO', value: 'OPPO' },
        { label: 'realme', value: 'realme' },
        { label: 'Shokz', value: 'Shokz' },
        { label: 'soundcore', value: 'soundcore' },
        { label: 'Soundpeats', value: 'Soundpeats' },
        { label: 'HAVIT', value: 'HAVIT' },
        { label: 'AVA+', value: 'AVA+' },
        { label: 'Baseus', value: 'Baseus' },
        { label: 'Rezo', value: 'Rezo' },
        { label: 'Alpha Works', value: 'Alpha Works' },
        { label: 'Soul', value: 'Soul' },
        { label: 'SOUNARC', value: 'SOUNARC' },
        { label: 'Asus', value: 'Asus' },
        { label: 'MONSTER', value: 'MONSTER' },
        { label: 'Denon', value: 'Denon' },
        { label: 'Mozard', value: 'Mozard' }
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
      label: 'Thời lượng pin',
      multiSelect: false,
      options: [
        { label: 'Dưới 4 tiếng', value: 'earHeadphone_battery_under4' },
        { label: 'Từ 4 đến 6 tiếng', value: 'earHeadphone_battery_4to6' },
        { label: 'Từ 6 đến 8 tiếng', value: 'earHeadphone_battery_6to8' },
<<<<<<< HEAD
        { label: 'Trên 8 tiếng', value: 'earHeadphone_battery_above8' }
=======
        { label: 'Trên 8 tiếng', value: 'earHeadphone_battery_over8' }
>>>>>>> server
      ]
    }
  ],
  earphoneBenefits: [
    {
      key: 'tags',
      label: 'Tiện ích',
      multiSelect: true,
      options: [
        { label: 'Sạc không dây', value: 'earHeadphone_benefit_wirelessCharge' },
        { label: 'Chống nước', value: 'earHeadphone_benefit_waterProof' },
        { label: 'Mic đàm thoại', value: 'earHeadphone_benefit_mic' },
        { label: 'Chống ồn ANC', value: 'earHeadphone_benefit_anc' },
        { label: 'Chống ồn ENC', value: 'earHeadphone_benefit_enc' },
      ]
    }
  ]
};

// Headphone Filters (Tai nghe chụp tai)
export const headphoneFilterData: FilterData = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'HAVIT', value: 'HAVIT' },
        { label: 'Baseus', value: 'Baseus' },
        { label: 'Sony', value: 'Sony' },
        { label: 'Alpha Works', value: 'Alpha Works' },
        { label: 'JBL', value: 'JBL' },
        { label: 'Asus', value: 'Asus' },
        { label: 'soundcore', value: 'soundcore' },
        { label: 'Marshall', value: 'Marshall' },
        { label: 'Zadez', value: 'Zadez' },
        { label: 'HP HyperX', value: 'HP HyperX' },
        { label: 'Apple', value: 'Apple' },
        { label: 'Beats', value: 'Beats' }
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
  earphoneBenefits: [
    {
      key: 'tags',
      label: 'Tiện ích',
      multiSelect: true,
      options: [
        { label: 'Mic đàm thoại', value: 'earHeadphone_benefit_mic' },
        { label: 'Chống ồn ENC', value: 'earHeadphone_benefit_enc' },
      ]
    }
<<<<<<< HEAD
=======
  ],

  earphoneBattery: [
    {
      key: 'tags',
      label: 'Thời lượng pin',
      multiSelect: true,
      options: [
        { label: '8 tiếng trở lên', value: 'earHeadphone_battery_over8' },
      ]
    }
>>>>>>> server
  ]
};

// Audio Filters - Backward compatibility (sẽ được deprecated)
export const audioFilterData: FilterData = wirelessEarphoneFilterData;

<<<<<<< HEAD
// Phukien Filters - Updated structure  
export const phukienFilterData: FilterData = {
=======
// Backup Charger Filters (Sạc dự phòng)
export const backupChargerFilterData: FilterData = {
>>>>>>> server
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'Anker', value: 'Anker' },
        { label: 'AVA', value: 'AVA,AVA+' },
        { label: 'Baseus', value: 'Baseus' },
        { label: 'Hydrus', value: 'Hydrus' },
        { label: 'Mazer', value: 'Mazer' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Ugreen', value: 'Ugreen' },
        { label: 'Xiaomi', value: 'Xiaomi' },
        { label: 'Xmobile', value: 'Xmobile' }
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
        { label: 'Cho laptop', value: 'backupCharger_type_forLaptop' }
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
        { label: 'Magsafe/Magnetic', value: 'backupCharger_benefit_magsafe' }
      ]
    }
  ]
};

<<<<<<< HEAD
=======
// Phukien Filters - Updated structure  
export const phukienFilterData: FilterData = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      isSearchable: true,
      multiSelect: true,
      options: [
        { label: 'Anker', value: 'Anker' },
        { label: 'AVA', value: 'AVA,AVA+' },
        { label: 'Baseus', value: 'Baseus' },
        { label: 'Hydrus', value: 'Hydrus' },
        { label: 'Mazer', value: 'Mazer' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Ugreen', value: 'Ugreen' },
        { label: 'Xiaomi', value: 'Xiaomi' },
        { label: 'Xmobile', value: 'Xmobile' }
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
  ]
};

>>>>>>> server
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
  laptop: laptopFilterData,
  audio: audioFilterData, // Deprecated - dùng cho backward compatibility
  wiredEarphone: wiredEarphoneFilterData,
  wirelessEarphone: wirelessEarphoneFilterData,
  headphone: headphoneFilterData,
<<<<<<< HEAD
=======
  backup_charger: backupChargerFilterData,
>>>>>>> server
  phukien: phukienFilterData
};