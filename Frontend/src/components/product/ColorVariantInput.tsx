// src/components/product/ColorVariantInput.tsx
import React, { useState } from 'react';

interface ColorVariantInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

const ColorVariantInput: React.FC<ColorVariantInputProps> = ({ colors, onChange }) => {
  const [newColor, setNewColor] = useState('');
  
  const handleAddColor = () => {
    if (newColor.trim() !== '') {
      const updatedColors = [...colors, newColor.trim()];
      onChange(updatedColors);
      setNewColor('');
    }
  };
  
  const handleRemoveColor = (index: number) => {
    const updatedColors = [...colors];
    updatedColors.splice(index, 1);
    onChange(updatedColors);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddColor();
    }
  };
  
  return (
    <div>
      <label className="form-label">Màu sắc</label>
      <div className="mb-2">
        {colors.filter(c => c.trim() !== '').map((color, index) => (
          <span
            key={index}
            className="badge bg-primary me-2 mb-2 p-2"
            style={{ fontSize: '0.9rem' }}
          >
            {color}
            <button
              type="button"
              className="btn-close btn-close-white ms-2"
              style={{ fontSize: '0.6rem' }}
              onClick={() => handleRemoveColor(index)}
              aria-label="Close"
            ></button>
          </span>
        ))}
      </div>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Nhập màu sắc"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleAddColor}
        >
          Thêm
        </button>
      </div>
      <small className="text-muted">Nhấn Enter hoặc nút Thêm để thêm màu sắc</small>
    </div>
  );
};

export default ColorVariantInput;