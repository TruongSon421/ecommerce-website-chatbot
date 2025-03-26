// src/components/product/LaptopConfigForm.tsx
import React from "react";
import { LaptopConfig } from "../../../types/product";

interface LaptopConfigFormProps {
  config: LaptopConfig;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof LaptopConfig
  ) => void;
}

const LaptopConfigForm: React.FC<LaptopConfigFormProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Bộ xử lý */}
      <div>
        <h6 className="text-md font-medium text-gray-700 mb-2">Bộ xử lý</h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Model CPU</label>
            <input
              type="text"
              value={config.processorModel || ""}
              onChange={(e) => onChange(e, "processorModel")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Intel Core i7-12700H"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Tốc độ CPU</label>
            <input
              type="text"
              value={config.cpuSpeed || ""}
              onChange={(e) => onChange(e, "cpuSpeed")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 2.3 GHz"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Tốc độ tối đa</label>
            <input
              type="text"
              value={config.maxCpuSpeed || ""}
              onChange={(e) => onChange(e, "maxCpuSpeed")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 4.7 GHz"
            />
          </div>
        </div>
      </div>

      {/* Bộ nhớ RAM, Ổ cứng */}
      <div>
        <h6 className="text-md font-medium text-gray-700 mb-2">Bộ nhớ RAM, Ổ cứng</h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">RAM</label>
            <input
              type="text"
              value={config.ram || ""}
              onChange={(e) => onChange(e, "ram")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 16GB"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Loại RAM</label>
            <input
              type="text"
              value={config.ramType || ""}
              onChange={(e) => onChange(e, "ramType")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: DDR4"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Ổ cứng</label>
            <input
              type="text"
              value={config.storage || ""}
              onChange={(e) => onChange(e, "storage")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 512GB SSD"
            />
          </div>
        </div>
      </div>

      {/* Màn hình */}
      <div>
        <h6 className="text-md font-medium text-gray-700 mb-2">Màn hình</h6>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Kích thước màn hình</label>
            <input
              type="text"
              value={config.screenSize || ""}
              onChange={(e) => onChange(e, "screenSize")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 14 inch"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Độ phân giải</label>
            <input
              type="text"
              value={config.resolution || ""}
              onChange={(e) => onChange(e, "resolution")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 2560x1600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopConfigForm;