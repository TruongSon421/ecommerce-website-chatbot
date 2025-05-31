import React, { useState, useEffect } from "react";
import { LaptopConfig } from "../../../types/product";

interface LaptopConfigFormProps {
  config: LaptopConfig;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof LaptopConfig
  ) => void;
  onArrayUpdate: (field: keyof LaptopConfig, arrayValue: string[]) => void;
}

const LaptopConfigForm: React.FC<LaptopConfigFormProps> = ({ config, onChange, onArrayUpdate }) => {
  // Trạng thái tạm thời cho các trường mảng
  const [tempStorage, setTempStorage] = useState<string>("");
  const [tempColorGamut, setTempColorGamut] = useState<string>("");
  const [tempDisplayTechnology, setTempDisplayTechnology] = useState<string>("");
  const [tempAudioTechnology, setTempAudioTechnology] = useState<string>("");
  const [tempWirelessConnectivity, setTempWirelessConnectivity] = useState<string>("");
  const [tempPorts, setTempPorts] = useState<string>("");
  const [tempOtherFeatures, setTempOtherFeatures] = useState<string>("");

  // Cập nhật trạng thái ban đầu từ config
  useEffect(() => {
    setTempStorage(Array.isArray(config.storage) ? config.storage.join("\n") : "");
    setTempColorGamut(Array.isArray(config.colorGamut) ? config.colorGamut.join("\n") : "");
    setTempDisplayTechnology(Array.isArray(config.displayTechnology) ? config.displayTechnology.join("\n") : "");
    setTempAudioTechnology(Array.isArray(config.audioTechnology) ? config.audioTechnology.join("\n") : "");
    setTempWirelessConnectivity(Array.isArray(config.wirelessConnectivity) ? config.wirelessConnectivity.join("\n") : "");
    setTempPorts(Array.isArray(config.ports) ? config.ports.join("\n") : "");
    setTempOtherFeatures(Array.isArray(config.otherFeatures) ? config.otherFeatures.join("\n") : "");
  }, [config]);

  // Hàm xử lý blur cho các trường mảng
  const handleArrayBlur = (field: keyof LaptopConfig, value: string) => {
    const arrayValue = value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item !== "");
    onArrayUpdate(field, arrayValue);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-md shadow-sm">
      <h6 className="text-lg font-semibold text-gray-800 mb-2">Cấu hình laptop</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bộ xử lý */}
        <div>
          <label htmlFor="processorModel" className="block text-gray-700 font-medium mb-1">
            Mô hình bộ xử lý
          </label>
          <input
            type="text"
            id="processorModel"
            value={config.processorModel || ""}
            onChange={(e) => onChange(e, "processorModel")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Intel Core i7-12700H"
          />
        </div>
        {/* Thêm coreCount, threadCount, cpuSpeed, maxCpuSpeed tương tự */}

        {/* Bộ nhớ RAM, Ổ cứng */}
        <div>
          <label htmlFor="ram" className="block text-gray-700 font-medium mb-1">
            RAM
          </label>
          <input
            type="text"
            id="ram"
            value={config.ram || ""}
            onChange={(e) => onChange(e, "ram")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 16 GB"
          />
        </div>
        <div>
          <label htmlFor="storage" className="block text-gray-700 font-medium mb-1">
            Dung lượng lưu trữ
          </label>
          <textarea
            id="storage"
            value={tempStorage}
            onChange={(e) => setTempStorage(e.target.value)}
            onBlur={() => handleArrayBlur("storage", tempStorage)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: 512 GB SSD, 1 TB HDD"
          />
        </div>
        {/* Thêm ramType, ramBusSpeed, maxRam tương tự */}

        {/* Màn hình */}
        <div>
          <label htmlFor="screenSize" className="block text-gray-700 font-medium mb-1">
            Kích thước màn hình
          </label>
          <input
            type="text"
            id="screenSize"
            value={config.screenSize || ""}
            onChange={(e) => onChange(e, "screenSize")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 15.6 inch"
          />
        </div>
        <div>
          <label htmlFor="colorGamut" className="block text-gray-700 font-medium mb-1">
            Màu sắc màn hình
          </label>
          <textarea
            id="colorGamut"
            value={tempColorGamut}
            onChange={(e) => setTempColorGamut(e.target.value)}
            onBlur={() => handleArrayBlur("colorGamut", tempColorGamut)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: 100% sRGB, 90% DCI-P3"
          />
        </div>
        {/* Thêm resolution, refreshRate, displayTechnology tương tự */}

        {/* Đồ họa và Âm thanh */}
        <div>
          <label htmlFor="graphicCard" className="block text-gray-700 font-medium mb-1">
            Card đồ họa
          </label>
          <input
            type="text"
            id="graphicCard"
            value={config.graphicCard || ""}
            onChange={(e) => onChange(e, "graphicCard")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: NVIDIA GeForce RTX 3060"
          />
        </div>
        <div>
          <label htmlFor="audioTechnology" className="block text-gray-700 font-medium mb-1">
            Công nghệ âm thanh
          </label>
          <textarea
            id="audioTechnology"
            value={tempAudioTechnology}
            onChange={(e) => setTempAudioTechnology(e.target.value)}
            onBlur={() => handleArrayBlur("audioTechnology", tempAudioTechnology)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Dolby Atmos, Bang & Olufsen"
          />
        </div>
        {/* Thêm ports, wirelessConnectivity, webcam, otherFeatures, keyboardBacklight tương tự */}

        {/* Kích thước - Khối lượng - Pin */}
        <div>
          <label htmlFor="size" className="block text-gray-700 font-medium mb-1">
            Kích thước
          </label>
          <input
            type="text"
            id="size"
            value={config.size || ""}
            onChange={(e) => onChange(e, "size")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 35.4 x 24.1 x 1.8 cm"
          />
        </div>
        {/* Thêm material, battery, os, release tương tự */}
      </div>
    </div>
  );
};

export default LaptopConfigForm;