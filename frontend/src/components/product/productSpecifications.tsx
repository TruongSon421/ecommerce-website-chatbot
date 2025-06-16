import React, { useState } from 'react';

// Define the interface for a specification
interface Specification {
  name: string;
  value: string | string[];
}

// Define the interface for a category
interface Category {
  name: string;
  specs: string[]; // Array of specification names belonging to this category
}

// Define the props for the ProductSpecifications component
interface SpecificationProps {
  specifications: Specification[];
  productType?: string; // Add productType prop to determine which categories to use
}

// Categories for different product types
const phoneCategories: Category[] = [
  {
    name: 'Cấu hình & Bộ nhớ',
    specs: [
      'Hệ điều hành',
      'Vi xử lý',
      'Tốc độ chip',
      'Chip đồ họa',
      'RAM',
      'Dung lượng',
      'Dung lượng khả dụng',
      'Danh bạ',
    ],
  },
  {
    name: 'Camera & Màn hình',
    specs: [
      'Độ phân giải camera sau',
      'Quay phim camera sau',
      'Đèn flash',
      'Tính năng camera sau',
      'Độ phân giải camera trước',
      'Tính năng camera trước',
      'Công nghệ màn hình',
      'Độ phân giải màn hình',
      'Màn hình rộng',
      'Độ sáng tối đa',
      'Mặt kính cảm ứng',
    ],
  },
  {
    name: 'Pin & Sạc',
    specs: [
      'Dung lượng pin',
      'Loại pin',
      'Hỗ trợ sạc tối đa',
      'Công nghệ pin',
    ],
  },
  {
    name: 'Tiện ích',
    specs: [
      'Bảo mật nâng cao',
      'Tính năng đặc biệt',
      'Kháng nước, bụi',
      'Ghi âm',
      'Xem phim',
      'Nghe nhạc',
    ],
  },
  {
    name: 'Kết nối',
    specs: [
      'Mạng di động',
      'SIM',
      'WiFi',
      'GPS',
      'Bluetooth',
      'Jack tai nghe',
      'Kết nối khác',
    ],
  },
  {
    name: 'Thiết kế & Chất liệu',
    specs: [
      'Kiểu thiết kế',
      'Chất liệu',
      'Kích thước, khối lượng',
    ],
  },
];

const laptopCategories: Category[] = [
  {
    name: 'Bộ xử lý',
    specs: [
      'Mô hình bộ xử lý',
      'Công nghệ CPU',
      'Số core',
      'Số luồng',
      'Tốc độ CPU',
      'Tốc độ tối đa',
      'Cache',
      'Kiến trúc',
    ],
  },
  {
    name: 'Bộ nhớ & Lưu trữ',
    specs: [
      'RAM',
      'Loại RAM',
      'Tốc độ bus RAM',
      'RAM tối đa',
      'Số khe RAM',
      'Dung lượng lưu trữ',
      'Loại ổ cứng',
      'Tốc độ đọc/ghi',
      'Khe mở rộng',
    ],
  },
  {
    name: 'Màn hình',
    specs: [
      'Kích thước màn hình',
      'Độ phân giải',
      'Tỷ lệ khung hình',
      'Tần số quét',
      'Độ phủ màu',
      'Công nghệ màn hình',
      'Cảm ứng màn hình',
      'Độ sáng',
      'Tỷ lệ tương phản',
      'Góc nhìn',
    ],
  },
  {
    name: 'Đồ họa',
    specs: [
      'Card màn hình',
      'GPU tích hợp',
      'GPU rời',
      'VRAM',
      'Hỗ trợ DirectX',
      'Hỗ trợ OpenGL',
      'Ray Tracing',
      'DLSS',
    ],
  },
  {
    name: 'Âm thanh & Webcam',
    specs: [
      'Công nghệ âm thanh',
      'Loa',
      'Microphone',
      'Jack tai nghe',
      'Webcam',
      'Độ phân giải webcam',
      'Tính năng webcam',
    ],
  },
  {
    name: 'Kết nối & Cổng giao tiếp',
    specs: [
      'Cổng giao tiếp',
      'Kết nối không dây',
      'WiFi',
      'Bluetooth',
      'LAN',
      'USB',
      'HDMI',
      'Thunderbolt',
      'SD Card',
    ],
  },
  {
    name: 'Pin & Nguồn',
    specs: [
      'Pin',
      'Thời lượng pin',
      'Sạc nhanh',
      'Công suất adapter',
      'Tiết kiệm pin',
    ],
  },
  {
    name: 'Bàn phím & Touchpad',
    specs: [
      'Bàn phím',
      'Đèn nền bàn phím',
      'Touchpad',
      'Tính năng bàn phím',
      'Layout bàn phím',
    ],
  },
  {
    name: 'Thiết kế & Chất liệu',
    specs: [
      'Kích thước',
      'Khối lượng',
      'Chất liệu',
      'Độ dày',
      'Màu sắc',
      'Thiết kế',
    ],
  },
  {
    name: 'Hệ điều hành & Tính năng khác',
    specs: [
      'Hệ điều hành',
      'Phần mềm đi kèm',
      'Tính năng khác',
      'Bảo mật',
      'Cảm biến',
      'Chứng nhận',
    ],
  },
];

// Categories for audio products (based on actual API response)
const audioCategories: Category[] = [
  {
    name: 'Kết nối và tương thích',
    specs: [
      'Tương thích',
      'Jack cắm',
      'Kết nối cùng lúc',
    ],
  },
  {
    name: 'Tính năng điều khiển',
    specs: [
      'Điều khiển',
      'Phím điều khiển',
    ],
  },
  {
    name: 'Tính năng đặc biệt',
    specs: [
      'Tiện ích',
    ],
  },
  {
    name: 'Thiết kế và chất liệu',
    specs: [
      'Khối lượng',
    ],
  },
  {
    name: 'Xuất xứ và bảo hành',
    specs: [
      'Thương hiệu của',
      'Sản xuất tại',
    ],
  },
];

// Categories for backup charger products (based on actual API response)
const backupChargerCategories: Category[] = [
  {
    name: 'Thông số pin',
    specs: [
      'Lõi pin',
      'Thời gian sạc đầy pin',
    ],
  },
  {
    name: 'Công nghệ và tính năng',
    specs: [
      'Công nghệ/ Tiện ích',
    ],
  },
  {
    name: 'Thông số kỹ thuật',
    specs: [
      'Nguồn ra',
      'Nguồn vào',
    ],
  },
  {
    name: 'Thiết kế và kích thước',
    specs: [
      'Kích thước',
      'Khối lượng',
    ],
  },
  {
    name: 'Xuất xứ và bảo hành',
    specs: [
      'Thương hiệu của',
      'Sản xuất tại',
    ],
  },
];

// Categories for other product types (tablets, accessories, etc.)
const defaultCategories: Category[] = [
  {
    name: 'Thông số kỹ thuật',
    specs: [
      'Kích thước',
      'Khối lượng',
      'Chất liệu',
      'Màu sắc',
      'Xuất xứ',
      'Bảo hành',
    ],
  },
  {
    name: 'Tính năng',
    specs: [
      'Tính năng chính',
      'Tính năng phụ',
      'Hỗ trợ',
      'Tương thích',
      'Kết nối',
      'Điều khiển',
    ],
  },
  {
    name: 'Thiết kế & Chất lượng',
    specs: [
      'Thiết kế',
      'Chất lượng xây dựng',
      'Độ bền',
      'Kháng nước',
      'Chống bụi',
      'Tiêu chuẩn',
    ],
  },
];

// Function to get appropriate categories based on product type
const getCategoriesForProductType = (productType?: string): Category[] => {
  if (!productType) return defaultCategories;
  
  const type = productType.toLowerCase();
  
  // Debug log to see what product type is being detected
  console.log('Debug - ProductType:', productType, 'Lowercase:', type);
  
  // Audio detection (check FIRST to avoid conflict with "phone" in "wireless_earphone")
  if (type.includes('audio') || type.includes('earbuds') || type.includes('headphones') || 
      type.includes('headphone') || type.includes('tai nghe') || type.includes('loa') || 
      type.includes('speaker') || type.includes('âm thanh') || type.includes('earbud') ||
      type.includes('earphone') || type.includes('wireless_earphone')) {
  
    return audioCategories;
  } 
  // Phone detection (after audio to avoid conflict)
  else if (type.includes('smartphone') || type.includes('điện thoại') || 
           (type.includes('phone') && !type.includes('earphone') && !type.includes('headphone'))) {
    
    return phoneCategories;
  } 
  // Laptop detection
  else if (type.includes('laptop') || type.includes('máy tính') || type.includes('notebook')) {
  
    return laptopCategories;
  } 
  // Backup charger detection (more comprehensive)
  else if (type.includes('backup_charger') || type.includes('sạc dự phòng') || type.includes('pin dự phòng') ||
           type.includes('powerbank') || type.includes('power bank') || type.includes('charger') ||
           type.includes('pin sạc') || type.includes('sạc pin')) {
   
    return backupChargerCategories;
  } 
  else {
    console.log('Debug - Using default categories for:', type);
    return defaultCategories;
  }
};

const ProductSpecifications: React.FC<SpecificationProps> = ({ specifications, productType }) => {
  // Get appropriate categories based on product type
  const categories = getCategoriesForProductType(productType);
  
  // Initialize state with the first category expanded by default
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    [categories[0]?.name || '']: true,
  });

  // Function to toggle the expanded state of a category
  const toggleCategory = (categoryName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {categories.map((category) => {
        // Filter specifications that belong to the current category
        const categorySpecs = specifications.filter((spec) =>
          category.specs.includes(spec.name)
        );

        // Only render the category if it has specifications
        if (categorySpecs.length === 0) return null;

        return (
          <div key={category.name} className="mb-4">
            {/* Category Header */}
            <div
              className="flex justify-between items-center cursor-pointer py-2 border-b border-gray-200"
              onClick={() => toggleCategory(category.name)}
            >
              <span className="text-black font-semibold text-lg">
                {category.name}
              </span>
              <span className="text-gray-600">
                {expanded[category.name] ? '➖' : '➕'}
              </span>
            </div>

            {/* Category Specifications (visible when expanded) */}
            {expanded[category.name] && (
              <div className="mt-2">
                {categorySpecs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-black font-medium w-1/2">
                      {spec.name}
                    </span>
                    <span className="text-blue-600 w-1/2 text-right">
                      {Array.isArray(spec.value)
                        ? spec.value.join(', ')
                        : spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductSpecifications;