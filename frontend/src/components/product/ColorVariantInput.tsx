// src/components/product/ColorVariantInput.tsx
import React, { useState } from "react";

interface ColorVariantInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

const ColorVariantInput: React.FC<ColorVariantInputProps> = ({ colors, onChange }) => {
  const [newColor, setNewColor] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  // Đảm bảo luôn có ít nhất một màu (mặc định là null nếu không có màu nào)
  React.useEffect(() => {
    if (colors.length === 0) {
      onChange([""]);
    }
  }, []);

  const realColors = colors.filter(c => c.trim() !== "");
  const hasDefaultColor = colors.includes("");
  const hasRealColors = realColors.length > 0;

  const handleAddColor = () => {
    if (newColor.trim() !== "") {
      let updatedColors = [...colors];
      
      // Nếu có màu mặc định và chưa có màu thực nào, thay thế màu mặc định
      if (hasDefaultColor && realColors.length === 0) {
        const defaultIndex = colors.findIndex(c => c === "");
        updatedColors[defaultIndex] = newColor.trim();
      } else {
        // Thêm màu mới vào danh sách
        updatedColors.push(newColor.trim());
      }

      // Hiển thị cảnh báo nếu chỉ có 1 màu thực
      const newRealColors = updatedColors.filter(c => c.trim() !== "");
      if (newRealColors.length === 1) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      } else {
        setShowWarning(false);
      }

      onChange(updatedColors);
      setNewColor("");
    }
  };

  const handleRemoveColor = (index: number) => {
    const colorToRemove = colors[index];
    
    // Không cho phép xóa nếu là màu mặc định duy nhất
    if (colorToRemove === "" && realColors.length === 0) {
      return; // Không thể xóa màu mặc định duy nhất
    }
    
    const updatedColors = [...colors];
    updatedColors.splice(index, 1);
    
    // Nếu xóa hết màu thực, thêm lại màu mặc định
    const remainingRealColors = updatedColors.filter(c => c.trim() !== "");
    if (remainingRealColors.length === 0 && !updatedColors.includes("")) {
      updatedColors.push("");
    }

    // Kiểm tra cảnh báo sau khi xóa
    if (remainingRealColors.length === 1) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    } else {
      setShowWarning(false);
    }

    onChange(updatedColors);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddColor();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-medium">Màu sắc</label>

      {/* Cảnh báo khi chỉ có 1 màu */}
      {showWarning && (
        <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Thêm ít nhất từ 2 màu sắc</span>
          </div>
        </div>
      )}

      {/* Danh sách màu đã thêm */}
      <div className="flex flex-wrap gap-2 mb-2">
        {colors.map((color, index) => {
          if (color.trim() === "") {
            // Hiển thị placeholder cho màu null
            return (
              <span
                key={`null-${index}`}
                className="inline-flex items-center px-3 py-1 bg-gray-300 text-gray-600 text-sm font-medium rounded-full border-2 border-dashed border-gray-400"
              >
                Màu mặc định
                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => handleRemoveColor(index)}
                  aria-label="Remove default color"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            );
          } else {
            // Hiển thị màu thực
            return (
              <span
                key={`color-${index}`}
                className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full shadow-sm transition-colors duration-200 hover:bg-blue-600"
              >
                {color}
                <button
                  type="button"
                  className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                  onClick={() => handleRemoveColor(index)}
                  aria-label="Remove color"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            );
          }
        })}
      </div>

      {/* Input thêm màu */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Nhập màu sắc (ví dụ: Đỏ, Xanh)"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleAddColor}
          disabled={!newColor.trim()}
        >
          Thêm
        </button>
      </div>

      {/* Thông tin hướng dẫn */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>• Nhấn Enter hoặc nút "Thêm" để thêm màu sắc</p>
        <p>• Màu mặc định sẽ luôn tồn tại nếu không có màu cụ thể nào</p>
        <p>• Thêm màu đầu tiên sẽ thay thế màu mặc định</p>
        <p>• Thêm ít nhất từ 2 màu sắc</p>
      </div>

      {/* Hiển thị trạng thái hiện tại */}
      <div className="text-sm">
        <span className="text-gray-600">
          Hiện tại: {realColors.length > 0 ? `${realColors.length} màu` : 'Chỉ có màu mặc định'}
          {hasDefaultColor && realColors.length > 0 && ' (+ màu mặc định)'}
        </span>
      </div>
    </div>
  );
};

export default ColorVariantInput;