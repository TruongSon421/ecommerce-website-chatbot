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

// Define the props for the SmartphoneSpecs component
interface SpecificationProps {
  specifications: Specification[];
}

// Predefined categories with their corresponding specification names
const categories: Category[] = [
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

const ProductSpecifications: React.FC<SpecificationProps> = ({ specifications }) => {
  // Initialize state with "Cấu hình & Bộ nhớ" expanded by default
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    'Cấu hình & Bộ nhớ': true,
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