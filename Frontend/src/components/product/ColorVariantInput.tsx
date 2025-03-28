// src/components/product/ColorVariantInput.tsx
import React, { useState } from "react";

interface ColorVariantInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

const ColorVariantInput: React.FC<ColorVariantInputProps> = ({ colors, onChange }) => {
  const [newColor, setNewColor] = useState("");

  const handleAddColor = () => {
    if (newColor.trim() !== "") {
      const updatedColors = [...colors, newColor.trim()];
      onChange(updatedColors);
      setNewColor("");
    }
  };

  const handleRemoveColor = (index: number) => {
    const updatedColors = [...colors];
    updatedColors.splice(index, 1);
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

      {/* Danh sách màu đã thêm */}
      <div className="flex flex-wrap gap-2 mb-2">
        {colors.filter((c) => c.trim() !== "").map((color, index) => (
          <span
            key={index}
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
                xmlns="http://www.w3.org/2000/svg"
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
        ))}
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

      {/* Gợi ý */}
      <p className="text-sm text-gray-500">Nhấn Enter hoặc nút "Thêm" để thêm màu sắc</p>
    </div>
  );
};

export default ColorVariantInput;