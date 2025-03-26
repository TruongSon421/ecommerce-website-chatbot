// src/components/product/PhoneConfigForm.tsx
import React from "react";
import { PhoneConfig } from "../../../types/product";

interface PhoneConfigFormProps {
  config: PhoneConfig;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof PhoneConfig
  ) => void;
}

const PhoneConfigForm: React.FC<PhoneConfigFormProps> = ({ config, onChange }) => {
  // Hàm xử lý mảng khi blur để chuyển từ chuỗi thành mảng
  const handleArrayBlur = (
    e: React.FocusEvent<HTMLTextAreaElement>,
    field: keyof PhoneConfig
  ) => {
    const value = e.target.value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item !== "");
    onChange({ ...e, target: { ...e.target, value } } as any, field);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-md shadow-sm">
      <h6 className="text-lg font-semibold text-gray-800 mb-2">Cấu hình điện thoại</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hệ điều hành */}
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
            placeholder="Ví dụ: iOS 18"
          />
        </div>

        {/* Bộ vi xử lý */}
        <div>
          <label htmlFor="processor" className="block text-gray-700 font-medium mb-1">
            Bộ vi xử lý
          </label>
          <input
            type="text"
            id="processor"
            value={config.processor || ""}
            onChange={(e) => onChange(e, "processor")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Apple A18 6 nhân"
          />
        </div>

        {/* Tốc độ CPU */}
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
            placeholder="Ví dụ: Hãng không công bố"
          />
        </div>

        {/* GPU */}
        <div>
          <label htmlFor="gpu" className="block text-gray-700 font-medium mb-1">
            GPU
          </label>
          <input
            type="text"
            id="gpu"
            value={config.gpu || ""}
            onChange={(e) => onChange(e, "gpu")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Apple GPU 4 nhân"
          />
        </div>

        {/* RAM */}
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
            placeholder="Ví dụ: 8 GB"
          />
        </div>

        {/* Dung lượng lưu trữ */}
        <div>
          <label htmlFor="storage" className="block text-gray-700 font-medium mb-1">
            Dung lượng lưu trữ
          </label>
          <input
            type="text"
            id="storage"
            value={config.storage || ""}
            onChange={(e) => onChange(e, "storage")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 128 GB"
          />
        </div>

        {/* Dung lượng khả dụng */}
        <div>
          <label htmlFor="availableStorage" className="block text-gray-700 font-medium mb-1">
            Dung lượng khả dụng
          </label>
          <input
            type="text"
            id="availableStorage"
            value={config.availableStorage || ""}
            onChange={(e) => onChange(e, "availableStorage")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 113 GB"
          />
        </div>

        {/* Giới hạn danh bạ */}
        <div>
          <label htmlFor="contactLimit" className="block text-gray-700 font-medium mb-1">
            Giới hạn danh bạ
          </label>
          <input
            type="text"
            id="contactLimit"
            value={config.contactLimit || ""}
            onChange={(e) => onChange(e, "contactLimit")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Không giới hạn"
          />
        </div>

        {/* Độ phân giải camera sau */}
        <div>
          <label
            htmlFor="rearCameraResolution"
            className="block text-gray-700 font-medium mb-1"
          >
            Độ phân giải camera sau
          </label>
          <input
            type="text"
            id="rearCameraResolution"
            value={config.rearCameraResolution || ""}
            onChange={(e) => onChange(e, "rearCameraResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 48 MP"
          />
        </div>

        {/* Quay video camera sau */}
        <div>
          <label
            htmlFor="rearVideoRecording"
            className="block text-gray-700 font-medium mb-1"
          >
            Quay video camera sau (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="rearVideoRecording"
            value={config.rearVideoRecording?.join("\n") || ""}
            onChange={(e) => onChange(e, "rearVideoRecording")}
            onBlur={(e) => handleArrayBlur(e, "rearVideoRecording")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: 4K 2160p@60fps, FullHD 1080p@30fps"
          />
        </div>

        {/* Đèn flash camera sau */}
        <div>
          <label htmlFor="rearFlash" className="block text-gray-700 font-medium mb-1">
            Đèn flash camera sau
          </label>
          <input
            type="text"
            id="rearFlash"
            value={config.rearFlash || ""}
            onChange={(e) => onChange(e, "rearFlash")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Có"
          />
        </div>

        {/* Tính năng camera sau */}
        <div>
          <label
            htmlFor="rearCameraFeatures"
            className="block text-gray-700 font-medium mb-1"
          >
            Tính năng camera sau (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="rearCameraFeatures"
            value={config.rearCameraFeatures?.join("\n") || ""}
            onChange={(e) => onChange(e, "rearCameraFeatures")}
            onBlur={(e) => handleArrayBlur(e, "rearCameraFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Zoom quang học, Xóa phông"
          />
        </div>

        {/* Độ phân giải camera trước */}
        <div>
          <label
            htmlFor="frontCameraResolution"
            className="block text-gray-700 font-medium mb-1"
          >
            Độ phân giải camera trước
          </label>
          <input
            type="text"
            id="frontCameraResolution"
            value={config.frontCameraResolution || ""}
            onChange={(e) => onChange(e, "frontCameraResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 12 MP"
          />
        </div>

        {/* Tính năng camera trước */}
        <div>
          <label
            htmlFor="frontCameraFeatures"
            className="block text-gray-700 font-medium mb-1"
          >
            Tính năng camera trước (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="frontCameraFeatures"
            value={config.frontCameraFeatures?.join("\n") || ""}
            onChange={(e) => onChange(e, "frontCameraFeatures")}
            onBlur={(e) => handleArrayBlur(e, "frontCameraFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Xóa phông, Quay video 4K"
          />
        </div>

        {/* Công nghệ hiển thị */}
        <div>
          <label
            htmlFor="displayTechnology"
            className="block text-gray-700 font-medium mb-1"
          >
            Công nghệ hiển thị
          </label>
          <input
            type="text"
            id="displayTechnology"
            value={config.displayTechnology || ""}
            onChange={(e) => onChange(e, "displayTechnology")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: OLED"
          />
        </div>

        {/* Độ phân giải màn hình */}
        <div>
          <label
            htmlFor="displayResolution"
            className="block text-gray-700 font-medium mb-1"
          >
            Độ phân giải màn hình
          </label>
          <input
            type="text"
            id="displayResolution"
            value={config.displayResolution || ""}
            onChange={(e) => onChange(e, "displayResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Super Retina XDR (1170 x 2532 Pixels)"
          />
        </div>

        {/* Kích thước màn hình */}
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
            placeholder="Ví dụ: 6.1 - Tần số quét 60 Hz" 
          />
        </div>

        {/* Độ sáng tối đa */}
        <div>
          <label htmlFor="maxBrightness" className="block text-gray-700 font-medium mb-1">
            Độ sáng tối đa
          </label>
          <input
            type="text"
            id="maxBrightness"
            value={config.maxBrightness || ""}
            onChange={(e) => onChange(e, "maxBrightness")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 1200 nits"
          />
        </div>

        {/* Kính bảo vệ */}
        <div>
          <label htmlFor="screenProtection" className="block text-gray-700 font-medium mb-1">
            Kính bảo vệ
          </label>
          <input
            type="text"
            id="screenProtection"
            value={config.screenProtection || ""}
            onChange={(e) => onChange(e, "screenProtection")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Kính cường lực Ceramic Shield"
          />
        </div>

        {/* Dung lượng pin */}
        <div>
          <label htmlFor="batteryCapacity" className="block text-gray-700 font-medium mb-1">
            Dung lượng pin
          </label>
          <input
            type="text"
            id="batteryCapacity"
            value={config.batteryCapacity || ""}
            onChange={(e) => onChange(e, "batteryCapacity")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 26 giờ"
          />
        </div>

        {/* Loại pin */}
        <div>
          <label htmlFor="batteryType" className="block text-gray-700 font-medium mb-1">
            Loại pin
          </label>
          <input
            type="text"
            id="batteryType"
            value={config.batteryType || ""}
            onChange={(e) => onChange(e, "batteryType")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Li-Ion"
          />
        </div>

        {/* Công suất định mức tối đa */}
        <div>
          <label htmlFor="maxChargingPower" className="block text-gray-700 font-medium mb-1">
            Công suất định mức tối đa
          </label>
          <input
            type="text"
            id="maxChargingPower"
            value={config.maxChargingPower || ""}
            onChange={(e) => onChange(e, "maxChargingPower")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 20 W"
          />
        </div>

        {/* Tính năng pin */}
        <div>
          <label htmlFor="batteryFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng pin (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="batteryFeatures"
            value={config.batteryFeatures?.join("\n") || ""}
            onChange={(e) => onChange(e, "batteryFeatures")}
            onBlur={(e) => handleArrayBlur(e, "batteryFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Tiết kiệm pin, Sạc pin nhanh"
          />
        </div>

        {/* Tính năng bảo mật */}
        <div>
          <label htmlFor="securityFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng bảo mật (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="securityFeatures"
            value={config.securityFeatures?.join("\n") || ""}
            onChange={(e) => onChange(e, "securityFeatures")}
            onBlur={(e) => handleArrayBlur(e, "securityFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Mở khóa khuôn mặt Face ID"
          />
        </div>

        {/* Tính năng đặc biệt */}
        <div>
          <label htmlFor="specialFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng đặc biệt (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="specialFeatures"
            value={config.specialFeatures?.join("\n") || ""}
            onChange={(e) => onChange(e, "specialFeatures")}
            onBlur={(e) => handleArrayBlur(e, "specialFeatures")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Âm thanh Dolby Atmos, HDR10"
          />
        </div>

        {/* Chống nước */}
        <div>
          <label htmlFor="waterResistance" className="block text-gray-700 font-medium mb-1">
            Chống nước
          </label>
          <input
            type="text"
            id="waterResistance"
            value={config.waterResistance || ""}
            onChange={(e) => onChange(e, "waterResistance")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: IP68"
          />
        </div>

        {/* Ghi âm */}
        <div>
          <label htmlFor="recording" className="block text-gray-700 font-medium mb-1">
            Ghi âm
          </label>
          <input
            type="text"
            id="recording"
            value={config.recording || ""}
            onChange={(e) => onChange(e, "recording")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Có"
          />
        </div>

        {/* Video */}
        <div>
          <label htmlFor="video" className="block text-gray-700 font-medium mb-1">
            Video
          </label>
          <input
            type="text"
            id="video"
            value={config.video || ""}
            onChange={(e) => onChange(e, "video")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Hỗ trợ 4K"
          />
        </div>

        {/* Âm thanh */}
        <div>
          <label htmlFor="audio" className="block text-gray-700 font-medium mb-1">
            Âm thanh (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="audio"
            value={config.audio?.join("\n") || ""}
            onChange={(e) => onChange(e, "audio")}
            onBlur={(e) => handleArrayBlur(e, "audio")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: MP3, FLAC"
          />
        </div>

        {/* Mạng di động */}
        <div>
          <label htmlFor="mobileNetwork" className="block text-gray-700 font-medium mb-1">
            Mạng di động
          </label>
          <input
            type="text"
            id="mobileNetwork"
            value={config.mobileNetwork || ""}
            onChange={(e) => onChange(e, "mobileNetwork")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Hỗ trợ 5G"
          />
        </div>

        {/* Loại SIM */}
        <div>
          <label htmlFor="simType" className="block text-gray-700 font-medium mb-1">
            Loại SIM
          </label>
          <input
            type="text"
            id="simType"
            value={config.simType || ""}
            onChange={(e) => onChange(e, "simType")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 1 Nano SIM & 1 eSIM"
          />
        </div>

        {/* Wi-Fi */}
        <div>
          <label htmlFor="wifi" className="block text-gray-700 font-medium mb-1">
            Wi-Fi (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="wifi"
            value={config.wifi?.join("\n") || ""}
            onChange={(e) => onChange(e, "wifi")}
            onBlur={(e) => handleArrayBlur(e, "wifi")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Wi-Fi MIMO, Wi-Fi 6"
          />
        </div>

        {/* GPS */}
        <div>
          <label htmlFor="gps" className="block text-gray-700 font-medium mb-1">
            GPS (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="gps"
            value={config.gps?.join("\n") || ""}
            onChange={(e) => onChange(e, "gps")}
            onBlur={(e) => handleArrayBlur(e, "gps")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: GPS, GLONASS"
          />
        </div>

        {/* Bluetooth */}
        <div>
          <label htmlFor="bluetooth" className="block text-gray-700 font-medium mb-1">
            Bluetooth (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="bluetooth"
            value={config.bluetooth?.join("\n") || ""}
            onChange={(e) => onChange(e, "bluetooth")}
            onBlur={(e) => handleArrayBlur(e, "bluetooth")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: v5.3"
          />
        </div>

        {/* Cổng sạc */}
        <div>
          <label htmlFor="chargingPort" className="block text-gray-700 font-medium mb-1">
            Cổng sạc
          </label>
          <input
            type="text"
            id="chargingPort"
            value={config.chargingPort || ""}
            onChange={(e) => onChange(e, "chargingPort")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Type-C"
          />
        </div>

        {/* Jack tai nghe */}
        <div>
          <label htmlFor="headphoneJack" className="block text-gray-700 font-medium mb-1">
            Jack tai nghe
          </label>
          <input
            type="text"
            id="headphoneJack"
            value={config.headphoneJack || ""}
            onChange={(e) => onChange(e, "headphoneJack")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Type-C"
          />
        </div>

        {/* Kết nối khác */}
        <div>
          <label htmlFor="otherConnectivity" className="block text-gray-700 font-medium mb-1">
            Kết nối khác (phân tách bằng dấu phẩy hoặc xuống dòng)
          </label>
          <textarea
            id="otherConnectivity"
            value={config.otherConnectivity?.join("\n") || ""}
            onChange={(e) => onChange(e, "otherConnectivity")}
            onBlur={(e) => handleArrayBlur(e, "otherConnectivity")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: NFC"
          />
        </div>

        {/* Kiểu thiết kế */}
        <div>
          <label htmlFor="designType" className="block text-gray-700 font-medium mb-1">
            Kiểu thiết kế
          </label>
          <input
            type="text"
            id="designType"
            value={config.designType || ""}
            onChange={(e) => onChange(e, "designType")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Nguyên khối"
          />
        </div>

        {/* Chất liệu */}
        <div>
          <label htmlFor="materials" className="block text-gray-700 font-medium mb-1">
            Chất liệu
          </label>
          <input
            type="text"
            id="materials"
            value={config.materials || ""}
            onChange={(e) => onChange(e, "materials")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Khung nhôm & Mặt lưng kính cường lực"
          />
        </div>

        {/* Kích thước và trọng lượng */}
        <div>
          <label htmlFor="sizeWeight" className="block text-gray-700 font-medium mb-1">
            Kích thước và trọng lượng
          </label>
          <input
            type="text"
            id="sizeWeight"
            value={config.sizeWeight || ""}
            onChange={(e) => onChange(e, "sizeWeight")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Dài 146.7 mm - Ngang 71.5 mm - Dày 7.8 mm - Nặng 167 g"
          />
        </div>

        {/* Thời gian ra mắt */}
        <div>
          <label htmlFor="release" className="block text-gray-700 font-medium mb-1">
            Thời gian ra mắt
          </label>
          <input
            type="text"
            id="release"
            value={config.release || ""}
            onChange={(e) => onChange(e, "release")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 02/2025"
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneConfigForm;