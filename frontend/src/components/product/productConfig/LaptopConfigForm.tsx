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
  const [tempTouchScreen, setTempTouchScreen] = useState<string>("");
  const [tempAudioTechnology, setTempAudioTechnology] = useState<string>("");
  const [tempWirelessConnectivity, setTempWirelessConnectivity] = useState<string>("");
  const [tempPorts, setTempPorts] = useState<string>("");
  const [tempOtherFeatures, setTempOtherFeatures] = useState<string>("");

  // Cập nhật trạng thái ban đầu từ config
  useEffect(() => {
    setTempStorage(Array.isArray(config.storage) ? config.storage.join("\n") : "");
    setTempColorGamut(Array.isArray(config.colorGamut) ? config.colorGamut.join("\n") : "");
    setTempDisplayTechnology(Array.isArray(config.displayTechnology) ? config.displayTechnology.join("\n") : "");
    setTempTouchScreen(Array.isArray(config.touchScreen) ? config.touchScreen.join("\n") : "");
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
      <h6 className="text-lg font-semibold text-gray-800 mb-4">Cấu hình laptop</h6>
      
      {/* Bộ xử lý */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Bộ xử lý</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label htmlFor="coreCount" className="block text-gray-700 font-medium mb-1">
              Số core
            </label>
            <input
              type="text"
              id="coreCount"
              value={config.coreCount || ""}
              onChange={(e) => onChange(e, "coreCount")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 14 cores"
            />
          </div>
          <div>
            <label htmlFor="threadCount" className="block text-gray-700 font-medium mb-1">
              Số luồng
            </label>
            <input
              type="text"
              id="threadCount"
              value={config.threadCount || ""}
              onChange={(e) => onChange(e, "threadCount")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 20 threads"
            />
          </div>
          <div>
            <label htmlFor="cpuSpeed" className="block text-gray-700 font-medium mb-1">
              Tốc độ CPU
            </label>
            <input
              type="text"
              id="cpuSpeed"
              value={config.cpuSpeed || ""}
              onChange={(e) => onChange(e, "cpuSpeed")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 2.3 GHz"
            />
          </div>
          <div>
            <label htmlFor="maxCpuSpeed" className="block text-gray-700 font-medium mb-1">
              Tốc độ tối đa
            </label>
            <input
              type="text"
              id="maxCpuSpeed"
              value={config.maxCpuSpeed || ""}
              onChange={(e) => onChange(e, "maxCpuSpeed")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 4.7 GHz"
            />
          </div>
        </div>
      </div>

      {/* Bộ nhớ RAM và Ổ cứng */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Bộ nhớ</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label htmlFor="ramType" className="block text-gray-700 font-medium mb-1">
              Loại RAM
            </label>
            <input
              type="text"
              id="ramType"
              value={config.ramType || ""}
              onChange={(e) => onChange(e, "ramType")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: DDR4, DDR5"
            />
          </div>
          <div>
            <label htmlFor="ramBusSpeed" className="block text-gray-700 font-medium mb-1">
              Tốc độ bus RAM
            </label>
            <input
              type="text"
              id="ramBusSpeed"
              value={config.ramBusSpeed || ""}
              onChange={(e) => onChange(e, "ramBusSpeed")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 3200 MHz"
            />
          </div>
          <div>
            <label htmlFor="maxRam" className="block text-gray-700 font-medium mb-1">
              RAM tối đa
            </label>
            <input
              type="text"
              id="maxRam"
              value={config.maxRam || ""}
              onChange={(e) => onChange(e, "maxRam")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 32 GB"
            />
          </div>
          <div className="md:col-span-2">
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
              placeholder="Ví dụ: 512 GB SSD&#10;1 TB HDD"
            />
          </div>
        </div>
      </div>

      {/* Màn hình */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Màn hình</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label htmlFor="resolution" className="block text-gray-700 font-medium mb-1">
              Độ phân giải
            </label>
            <input
              type="text"
              id="resolution"
              value={config.resolution || ""}
              onChange={(e) => onChange(e, "resolution")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 1920 x 1080 (Full HD)"
            />
          </div>
          <div>
            <label htmlFor="refreshRate" className="block text-gray-700 font-medium mb-1">
              Tần số quét
            </label>
            <input
              type="text"
              id="refreshRate"
              value={config.refreshRate || ""}
              onChange={(e) => onChange(e, "refreshRate")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 144 Hz"
            />
          </div>
          <div>
            <label htmlFor="colorGamut" className="block text-gray-700 font-medium mb-1">
              Độ phủ màu
            </label>
            <textarea
              id="colorGamut"
              value={tempColorGamut}
              onChange={(e) => setTempColorGamut(e.target.value)}
              onBlur={() => handleArrayBlur("colorGamut", tempColorGamut)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: 100% sRGB&#10;90% DCI-P3"
            />
          </div>
          <div>
            <label htmlFor="displayTechnology" className="block text-gray-700 font-medium mb-1">
              Công nghệ màn hình
            </label>
            <textarea
              id="displayTechnology"
              value={tempDisplayTechnology}
              onChange={(e) => setTempDisplayTechnology(e.target.value)}
              onBlur={() => handleArrayBlur("displayTechnology", tempDisplayTechnology)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: IPS&#10;Anti-glare&#10;LED Backlit"
            />
          </div>
          <div>
            <label htmlFor="touchScreen" className="block text-gray-700 font-medium mb-1">
              Màn hình cảm ứng
            </label>
            <textarea
              id="touchScreen"
              value={tempTouchScreen}
              onChange={(e) => setTempTouchScreen(e.target.value)}
              onBlur={() => handleArrayBlur("touchScreen", tempTouchScreen)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: Multi-touch&#10;10-point touch"
            />
          </div>
        </div>
      </div>

      {/* Đồ họa và Âm thanh */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Đồ họa và Âm thanh</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Ví dụ: Dolby Atmos&#10;Bang & Olufsen"
            />
          </div>
        </div>
      </div>

      {/* Kết nối và Cổng giao tiếp */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Kết nối</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ports" className="block text-gray-700 font-medium mb-1">
              Cổng giao tiếp
            </label>
            <textarea
              id="ports"
              value={tempPorts}
              onChange={(e) => setTempPorts(e.target.value)}
              onBlur={() => handleArrayBlur("ports", tempPorts)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: 2x USB 3.0&#10;1x USB-C&#10;1x HDMI&#10;1x Audio jack"
            />
          </div>
          <div>
            <label htmlFor="wirelessConnectivity" className="block text-gray-700 font-medium mb-1">
              Kết nối không dây
            </label>
            <textarea
              id="wirelessConnectivity"
              value={tempWirelessConnectivity}
              onChange={(e) => setTempWirelessConnectivity(e.target.value)}
              onBlur={() => handleArrayBlur("wirelessConnectivity", tempWirelessConnectivity)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: Wi-Fi 6&#10;Bluetooth 5.2"
            />
          </div>
          <div>
            <label htmlFor="webcam" className="block text-gray-700 font-medium mb-1">
              Webcam
            </label>
            <input
              type="text"
              id="webcam"
              value={config.webcam || ""}
              onChange={(e) => onChange(e, "webcam")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 720p HD Webcam"
            />
          </div>
        </div>
      </div>

      {/* Thiết kế và Pin */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Thiết kế và Pin</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label htmlFor="material" className="block text-gray-700 font-medium mb-1">
              Chất liệu
            </label>
            <input
              type="text"
              id="material"
              value={config.material || ""}
              onChange={(e) => onChange(e, "material")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Nhôm, Nhựa ABS"
            />
          </div>
          <div>
            <label htmlFor="battery" className="block text-gray-700 font-medium mb-1">
              Pin
            </label>
            <input
              type="text"
              id="battery"
              value={config.battery || ""}
              onChange={(e) => onChange(e, "battery")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 4-cell 50WHr"
            />
          </div>
          <div>
            <label htmlFor="keyboardBacklight" className="block text-gray-700 font-medium mb-1">
              Đèn nền bàn phím
            </label>
            <input
              type="text"
              id="keyboardBacklight"
              value={config.keyboardBacklight || ""}
              onChange={(e) => onChange(e, "keyboardBacklight")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: RGB Backlight"
            />
          </div>
          <div>
            <label htmlFor="os" className="block text-gray-700 font-medium mb-1">
              Hệ điều hành
            </label>
            <input
              type="text"
              id="os"
              value={config.os || ""}
              onChange={(e) => onChange(e, "os")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Windows 11 Home"
            />
          </div>
        </div>
      </div>

      {/* Tính năng khác */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Tính năng khác</h6>
        <div>
          <label htmlFor="otherFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng khác
          </label>
          <textarea
            id="otherFeatures"
            value={tempOtherFeatures}
            onChange={(e) => setTempOtherFeatures(e.target.value)}
            onBlur={() => handleArrayBlur("otherFeatures", tempOtherFeatures)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Ví dụ: Fingerprint Reader&#10;Fast Charging&#10;Thunderbolt 4 Support"
          />
        </div>
      </div>
    </div>
  );
};

export default LaptopConfigForm;