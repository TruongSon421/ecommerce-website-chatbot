// src/data/filterData.ts

export type FilterOption = {
    label: string;
    value: string;
  };
  
  export type Filter = {
    key: string;
    label: string;
    options: FilterOption[];
  };
  
  export const phoneFilterData: { [key: string]: Filter[] } = {
    brands: [
      {
        key: 'brand',
        label: 'Hãng',
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
          { label: 'benco', value: 'benco' },
        ],
      },
    ],
    priceRanges: [
      {
        key: 'price',
        label: 'Giá',
        options: [
          { label: 'Dưới 2 triệu', value: '0-2000000' },
          { label: 'Từ 2 - 4 triệu', value: '2000000-4000000' },
          { label: 'Từ 4 - 7 triệu', value: '4000000-7000000' },
          { label: 'Từ 7 - 13 triệu', value: '7000000-13000000' },
          { label: 'Từ 13 - 20 triệu', value: '13000000-20000000' },
          { label: 'Trên 20 triệu', value: '20000000+' },
        ],
      },
    ],
    needs: [
      {
        key: 'tags',
        label: 'Nhu cầu',
        options: [
          { label: 'Chơi game / Cấu hình cao', value: 'phone_highSpecs' }, // Ánh xạ vào tags
          { label: 'Pin khủng trên 5000 mAh', value: 'phone_battery' },
          { label: 'Chụp ảnh, quay phim', value: 'phone_camera' },
          { label: 'Livestream', value: 'phone_livestream' },
          { label: 'Mỏng nhẹ', value: 'phone_slimLight' }, // Ánh xạ vào tags
        ],
      },
    ],
};

// Bộ lọc cho Laptop
const laptopFilterData: { [key: string]: Filter[] } = {
  brands: [
    {
      key: 'brand',
      label: 'Hãng',
      options: [
        { label: 'Dell', value: 'dell' },
        { label: 'HP', value: 'hp' },
        { label: 'Lenovo', value: 'lenovo' },
        { label: 'Asus', value: 'asus' },
        { label: 'Acer', value: 'acer' },
        { label: 'MSI', value: 'msi' },
        { label: 'MacBook', value: 'macbook' },
      ],
    },
  ],
  priceRanges: [
    {
      key: 'price',
      label: 'Giá',
      options: [
        { label: 'Dưới 10 triệu', value: '0-10000000' },
        { label: 'Từ 10 - 15 triệu', value: '10000000-15000000' },
        { label: 'Từ 15 - 20 triệu', value: '15000000-20000000' },
        { label: 'Từ 20 - 30 triệu', value: '20000000-30000000' },
        { label: 'Trên 30 triệu', value: '30000000+' },
      ],
    },
  ],
  needs: [
    {
      key: 'tags',
      label: 'Nhu cầu',
      options: [
        { label: 'Chơi game / Cấu hình cao', value: 'laptop_gaming' },
        { label: 'Học tập - Văn phòng', value: 'laptop_office' },
        { label: 'Đồ họa - Kỹ thuật', value: 'laptop_design' },
        { label: 'Mỏng nhẹ', value: 'laptop_slimLight' },
      ],
    },
  ],
  ram: [
    {
      key: 'ram',
      label: 'RAM',
      options: [
        { label: '8GB', value: '8' },
        { label: '16GB', value: '16' },
        { label: '32GB', value: '32' },
      ],
    },
  ],
  cpu: [
    {
      key: 'cpu',
      label: 'CPU',
      options: [
        { label: 'Intel i3', value: 'intel_i3' },
        { label: 'Intel i5', value: 'intel_i5' },
        { label: 'Intel i7', value: 'intel_i7' },
        { label: 'AMD Ryzen 5', value: 'amd_ryzen5' },
        { label: 'AMD Ryzen 7', value: 'amd_ryzen7' },
      ],
    },
  ],
  storage: [
    {
      key: 'storage',
      label: 'Ổ cứng',
      options: [
        { label: '256GB SSD', value: '256_ssd' },
        { label: '512GB SSD', value: '512_ssd' },
        { label: '1TB SSD', value: '1tb_ssd' },
      ],
    },
  ],
};

// Ánh xạ type với dữ liệu bộ lọc
export const filterData: { [key: string]: { [key: string]: Filter[] } } = {
  PHONE: phoneFilterData,
  LAPTOP: laptopFilterData,
};