import React, { useState } from 'react';

// Interface for backup charger configuration
export interface BackupChargerConfig {
  // Battery specifications
  batteryCore: string;
  chargingTime: string[];
  
  // Technology and features
  technology: string[];
  
  // Technical specifications
  outputPorts: string[];
  inputPorts: string[];
  
  // Design and dimensions
  dimensions: string;
  weight: string;
  
  // Origin and warranty
  brandOrigin: string;
  madeIn: string;
  
  // Additional fields for comprehensive config
  capacity: string;
  color: string[];
  warranty: string;
  certification: string[];
  accessories: string[];
}

interface BackupChargerConfigFormProps {
  onSubmit: (config: BackupChargerConfig) => void;
  initialData?: Partial<BackupChargerConfig>;
  isLoading?: boolean;
}

const BackupChargerConfigForm: React.FC<BackupChargerConfigFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const [config, setConfig] = useState<BackupChargerConfig>({
    batteryCore: initialData?.batteryCore || '',
    chargingTime: initialData?.chargingTime || [''],
    technology: initialData?.technology || [''],
    outputPorts: initialData?.outputPorts || [''],
    inputPorts: initialData?.inputPorts || [''],
    dimensions: initialData?.dimensions || '',
    weight: initialData?.weight || '',
    brandOrigin: initialData?.brandOrigin || '',
    madeIn: initialData?.madeIn || '',
    capacity: initialData?.capacity || '',
    color: initialData?.color || [''],
    warranty: initialData?.warranty || '',
    certification: initialData?.certification || [''],
    accessories: initialData?.accessories || [''],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BackupChargerConfig, string>>>({});

  // Handle input change for simple fields
  const handleInputChange = (field: keyof BackupChargerConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (field: keyof BackupChargerConfig, index: number, value: string) => {
    setConfig(prev => {
      const currentArray = prev[field] as string[];
      const newArray = [...currentArray];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  // Add new item to array field
  const addArrayItem = (field: keyof BackupChargerConfig) => {
    setConfig(prev => {
      const currentArray = prev[field] as string[];
      return { ...prev, [field]: [...currentArray, ''] };
    });
  };

  // Remove item from array field
  const removeArrayItem = (field: keyof BackupChargerConfig, index: number) => {
    setConfig(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.filter((_, i) => i !== index);
      return { ...prev, [field]: newArray.length > 0 ? newArray : [''] };
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BackupChargerConfig, string>> = {};

    if (!config.batteryCore.trim()) {
      newErrors.batteryCore = 'Vui lòng nhập loại lõi pin';
    }

    if (!config.capacity.trim()) {
      newErrors.capacity = 'Vui lòng nhập dung lượng pin';
    }

    if (!config.dimensions.trim()) {
      newErrors.dimensions = 'Vui lòng nhập kích thước';
    }

    if (!config.weight.trim()) {
      newErrors.weight = 'Vui lòng nhập khối lượng';
    }

    if (!config.brandOrigin.trim()) {
      newErrors.brandOrigin = 'Vui lòng nhập thương hiệu';
    }

    if (!config.madeIn.trim()) {
      newErrors.madeIn = 'Vui lòng nhập nơi sản xuất';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Filter out empty strings from arrays
      const cleanedConfig = {
        ...config,
        chargingTime: config.chargingTime.filter(item => item.trim() !== ''),
        technology: config.technology.filter(item => item.trim() !== ''),
        outputPorts: config.outputPorts.filter(item => item.trim() !== ''),
        inputPorts: config.inputPorts.filter(item => item.trim() !== ''),
        color: config.color.filter(item => item.trim() !== ''),
        certification: config.certification.filter(item => item.trim() !== ''),
        accessories: config.accessories.filter(item => item.trim() !== ''),
      };
      onSubmit(cleanedConfig);
    }
  };

  // Render array field
  const renderArrayField = (
    label: string,
    field: keyof BackupChargerConfig,
    placeholder: string,
    description?: string
  ) => {
    const values = config[field] as string[];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {description && <span className="text-xs text-gray-500 block">{description}</span>}
        </label>
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(field, index)}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(field)}
          className="text-blue-600 text-sm hover:text-blue-800"
        >
          + Thêm {label.toLowerCase()}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình Sạc dự phòng</h2>
        <p className="text-gray-600">Nhập thông tin chi tiết về sạc dự phòng</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Battery Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Pin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại lõi pin *
              </label>
              <input
                type="text"
                value={config.batteryCore}
                onChange={(e) => handleInputChange('batteryCore', e.target.value)}
                placeholder="VD: Li-Ion, Li-Po"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.batteryCore ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.batteryCore && (
                <p className="text-red-500 text-xs mt-1">{errors.batteryCore}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dung lượng pin *
              </label>
              <input
                type="text"
                value={config.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="VD: 10000mAh, 20000mAh"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            {renderArrayField(
              'Thời gian sạc đầy pin',
              'chargingTime',
              'VD: 3-4 giờ (dùng Adapter 3A)',
              'Nhập các thời gian sạc khác nhau tùy theo adapter'
            )}
          </div>
        </div>

        {/* Technology and Features */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Công nghệ & Tính năng</h3>
          <div className="space-y-4">
            {renderArrayField(
              'Công nghệ/ Tiện ích',
              'technology',
              'VD: Màn hình LED báo hiệu, Sạc nhanh',
              'Các công nghệ và tính năng đặc biệt'
            )}

            {renderArrayField(
              'Chứng nhận',
              'certification',
              'VD: CE, FCC, RoHS',
              'Các chứng nhận an toàn và chất lượng'
            )}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
          <div className="space-y-4">
            {renderArrayField(
              'Nguồn ra (Output)',
              'outputPorts',
              'VD: Type C: 5V-3A, USB: 5V-3A',
              'Các cổng ra và thông số điện áp, dòng điện'
            )}

            {renderArrayField(
              'Nguồn vào (Input)',
              'inputPorts',
              'VD: Type C: 5V-2A, Micro USB: 5V-2A',
              'Các cổng vào để sạc pin dự phòng'
            )}
          </div>
        </div>

        {/* Design and Dimensions */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thiết kế & Kích thước</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kích thước *
              </label>
              <input
                type="text"
                value={config.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="VD: Dày 3.07 cm - Rộng 6.96 cm - Dài 15.22 cm"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dimensions ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dimensions && (
                <p className="text-red-500 text-xs mt-1">{errors.dimensions}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khối lượng *
              </label>
              <input
                type="text"
                value={config.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="VD: 445g"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.weight ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            {renderArrayField(
              'Màu sắc',
              'color',
              'VD: Đen, Trắng, Xanh',
              'Các màu sắc có sẵn'
            )}
          </div>
        </div>

        {/* Origin and Warranty */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xuất xứ & Bảo hành</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu của *
              </label>
              <input
                type="text"
                value={config.brandOrigin}
                onChange={(e) => handleInputChange('brandOrigin', e.target.value)}
                placeholder="VD: Trung Quốc, Hàn Quốc"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.brandOrigin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.brandOrigin && (
                <p className="text-red-500 text-xs mt-1">{errors.brandOrigin}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sản xuất tại *
              </label>
              <input
                type="text"
                value={config.madeIn}
                onChange={(e) => handleInputChange('madeIn', e.target.value)}
                placeholder="VD: Trung Quốc, Việt Nam"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.madeIn ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.madeIn && (
                <p className="text-red-500 text-xs mt-1">{errors.madeIn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bảo hành
              </label>
              <input
                type="text"
                value={config.warranty}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
                placeholder="VD: 12 tháng, 24 tháng"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Accessories */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phụ kiện</h3>
          {renderArrayField(
            'Phụ kiện đi kèm',
            'accessories',
            'VD: Cáp USB-C, Túi đựng, Hướng dẫn sử dụng',
            'Các phụ kiện được bao gồm trong hộp'
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </div>
            ) : (
              'Lưu cấu hình'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BackupChargerConfigForm;
