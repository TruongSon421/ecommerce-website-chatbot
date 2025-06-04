import React from "react";
import { PhoneConfig } from "../../../types/product";

interface PhoneConfigFormProps {
  config: PhoneConfig;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof PhoneConfig
  ) => void;
  onArrayUpdate: (field: keyof PhoneConfig, arrayValue: string[]) => void;
}

const PhoneConfigForm: React.FC<PhoneConfigFormProps> = ({
  config,
  onChange,
  onArrayUpdate,
}) => {
  // Helper to handle array inputs (comma-separated strings)
  const handleArrayInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof PhoneConfig
  ) => {
    const values = e.target.value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    onArrayUpdate(field, values);
  };

  // Helper to display array values as comma-separated string
  const displayArray = (array: string[] | undefined) => {
    return array?.join(", ") || "";
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-md">
      <h6 className="text-lg font-medium text-gray-700">Cấu hình điện thoại</h6>

      {/* System & Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Hệ điều hành</label>
          <input
            type="text"
            value={config.os || ""}
            onChange={(e) => onChange(e, "os")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: iOS 18"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Vi xử lý</label>
          <input
            type="text"
            value={config.processor || ""}
            onChange={(e) => onChange(e, "processor")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: A18 Bionic"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Tốc độ chip</label>
          <input
            type="text"
            value={config.cpuSpeed || ""}
            onChange={(e) => onChange(e, "cpuSpeed")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 3.46 GHz"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Chip đồ họa</label>
          <input
            type="text"
            value={config.gpu || ""}
            onChange={(e) => onChange(e, "gpu")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 5-core GPU"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">RAM</label>
          <input
            type="text"
            value={config.ram || ""}
            onChange={(e) => onChange(e, "ram")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 8GB"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Dung lượng</label>
          <input
            type="text"
            value={config.storage || ""}
            onChange={(e) => onChange(e, "storage")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 128GB"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Dung lượng khả dụng</label>
          <input
            type="text"
            value={config.availableStorage || ""}
            onChange={(e) => onChange(e, "availableStorage")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 120GB"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Danh bạ</label>
          <input
            type="text"
            value={config.contactLimit || ""}
            onChange={(e) => onChange(e, "contactLimit")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Không giới hạn"
          />
        </div>
      </div>

      {/* Camera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Độ phân giải camera sau</label>
          <input
            type="text"
            value={config.rearCameraResolution || ""}
            onChange={(e) => onChange(e, "rearCameraResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 48MP + 12MP"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Quay phim camera sau</label>
          <input
            type="text"
            value={displayArray(config.rearVideoRecording)}
            onChange={(e) => handleArrayInput(e, "rearVideoRecording")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 4K@60fps, 1080p@120fps"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Đèn flash</label>
          <input
            type="text"
            value={config.rearFlash || ""}
            onChange={(e) => onChange(e, "rearFlash")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: True Tone"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Tính năng camera sau</label>
          <input
            type="text"
            value={displayArray(config.rearCameraFeatures)}
            onChange={(e) => handleArrayInput(e, "rearCameraFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Night mode, Deep Fusion"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Độ phân giải camera trước</label>
          <input
            type="text"
            value={config.frontCameraResolution || ""}
            onChange={(e) => onChange(e, "frontCameraResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 12MP"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Tính năng camera trước</label>
          <input
            type="text"
            value={displayArray(config.frontCameraFeatures)}
            onChange={(e) => handleArrayInput(e, "frontCameraFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Face ID, Animoji"
          />
        </div>
      </div>

      {/* Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Công nghệ màn hình</label>
          <input
            type="text"
            value={config.displayTechnology || ""}
            onChange={(e) => onChange(e, "displayTechnology")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Super Retina XDR"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Độ phân giải màn hình</label>
          <input
            type="text"
            value={config.displayResolution || ""}
            onChange={(e) => onChange(e, "displayResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 2556x1179"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Màn hình rộng</label>
          <input
            type="text"
            value={config.screenSize || ""}
            onChange={(e) => onChange(e, "screenSize")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 6.1 inch"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Độ sáng tối đa</label>
          <input
            type="text"
            value={config.maxBrightness || ""}
            onChange={(e) => onChange(e, "maxBrightness")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 2000 nits"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Mặt kính cảm ứng</label>
          <input
            type="text"
            value={config.screenProtection || ""}
            onChange={(e) => onChange(e, "screenProtection")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Ceramic Shield"
          />
        </div>
      </div>

      {/* Battery & Charging */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Dung lượng pin</label>
          <input
            type="text"
            value={config.batteryCapacity || ""}
            onChange={(e) => onChange(e, "batteryCapacity")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 4000mAh"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Loại pin</label>
          <input
            type="text"
            value={config.batteryType || ""}
            onChange={(e) => onChange(e, "batteryType")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Li-Ion"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Hỗ trợ sạc tối đa</label>
          <input
            type="text"
            value={config.maxChargingPower || ""}
            onChange={(e) => onChange(e, "maxChargingPower")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 20W"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Công nghệ pin</label>
          <input
            type="text"
            value={displayArray(config.batteryFeatures)}
            onChange={(e) => handleArrayInput(e, "batteryFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Fast charging, Wireless charging"
          />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Bảo mật nâng cao</label>
          <input
            type="text"
            value={displayArray(config.securityFeatures)}
            onChange={(e) => handleArrayInput(e, "securityFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Face ID, Fingerprint"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Tính năng đặc biệt</label>
          <input
            type="text"
            value={displayArray(config.specialFeatures)}
            onChange={(e) => handleArrayInput(e, "specialFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Apple Intelligence, Action Button"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Kháng nước, bụi</label>
          <input
            type="text"
            value={config.waterResistance || ""}
            onChange={(e) => onChange(e, "waterResistance")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: IP68"
          />
        </div>
      </div>

      {/* Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Ghi âm</label>
          <input
            type="text"
            value={displayArray(config.recording)}
            onChange={(e) => handleArrayInput(e, "recording")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Stereo recording"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Xem phim</label>
          <input
            type="text"
            value={displayArray(config.video)}
            onChange={(e) => handleArrayInput(e, "video")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: HDR, Dolby Vision"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Nghe nhạc</label>
          <input
            type="text"
            value={displayArray(config.audio)}
            onChange={(e) => handleArrayInput(e, "audio")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Spatial Audio"
          />
        </div>
      </div>

      {/* Connectivity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Mạng di động</label>
          <input
            type="text"
            value={config.mobileNetwork || ""}
            onChange={(e) => onChange(e, "mobileNetwork")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 5G"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">SIM</label>
          <input
            type="text"
            value={config.simType || ""}
            onChange={(e) => onChange(e, "simType")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Nano SIM, eSIM"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">WiFi</label>
          <input
            type="text"
            value={displayArray(config.wifi)}
            onChange={(e) => handleArrayInput(e, "wifi")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Wi-Fi 6E"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">GPS</label>
          <input
            type="text"
            value={displayArray(config.gps)}
            onChange={(e) => handleArrayInput(e, "gps")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: GPS, GLONASS"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Bluetooth</label>
          <input
            type="text"
            value={displayArray(config.bluetooth)}
            onChange={(e) => handleArrayInput(e, "bluetooth")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Bluetooth 5.3"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Cổng sạc</label>
          <input
            type="text"
            value={config.chargingPort || ""}
            onChange={(e) => onChange(e, "chargingPort")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: USB-C"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Jack tai nghe</label>
          <input
            type="text"
            value={config.headphoneJack || ""}
            onChange={(e) => onChange(e, "headphoneJack")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Không"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Kết nối khác</label>
          <input
            type="text"
            value={displayArray(config.otherConnectivity)}
            onChange={(e) => handleArrayInput(e, "otherConnectivity")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: NFC, UWB"
          />
        </div>
      </div>

      {/* Design & Build */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Kiểu thiết kế</label>
          <input
            type="text"
            value={config.designType || ""}
            onChange={(e) => onChange(e, "designType")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Nguyên khối"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Chất liệu</label>
          <input
            type="text"
            value={config.materials || ""}
            onChange={(e) => onChange(e, "materials")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: Kính, Nhôm"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Kích thước, khối lượng</label>
          <input
            type="text"
            value={config.sizeWeight || ""}
            onChange={(e) => onChange(e, "sizeWeight")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Ví dụ: 146.7 x 71.5 x 7.8 mm, 174g"
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneConfigForm;