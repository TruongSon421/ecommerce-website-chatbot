// src/components/product/productConfig/PhoneConfigForm.tsx
import React, { useState, useEffect } from "react";
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
  // Trạng thái tạm thời cho các trường mảng
  const [tempRearVideoRecording, setTempRearVideoRecording] = useState<string>("");
  const [tempRearCameraFeatures, setTempRearCameraFeatures] = useState<string>("");
  const [tempFrontCameraFeatures, setTempFrontCameraFeatures] = useState<string>("");
  const [tempBatteryFeatures, setTempBatteryFeatures] = useState<string>("");
  const [tempSecurityFeatures, setTempSecurityFeatures] = useState<string>("");
  const [tempSpecialFeatures, setTempSpecialFeatures] = useState<string>("");
  const [tempRecording, setTempRecording] = useState<string>("");
  const [tempVideo, setTempVideo] = useState<string>("");
  const [tempAudio, setTempAudio] = useState<string>("");
  const [tempWifi, setTempWifi] = useState<string>("");
  const [tempGps, setTempGps] = useState<string>("");
  const [tempBluetooth, setTempBluetooth] = useState<string>("");
  const [tempOtherConnectivity, setTempOtherConnectivity] = useState<string>("");

  // Cập nhật trạng thái ban đầu từ config
  useEffect(() => {
    setTempRearVideoRecording(
      Array.isArray(config.rearVideoRecording) ? config.rearVideoRecording.join("\n") : ""
    );
    setTempRearCameraFeatures(
      Array.isArray(config.rearCameraFeatures) ? config.rearCameraFeatures.join("\n") : ""
    );
    setTempFrontCameraFeatures(
      Array.isArray(config.frontCameraFeatures) ? config.frontCameraFeatures.join("\n") : ""
    );
    setTempBatteryFeatures(
      Array.isArray(config.batteryFeatures) ? config.batteryFeatures.join("\n") : ""
    );
    setTempSecurityFeatures(
      Array.isArray(config.securityFeatures) ? config.securityFeatures.join("\n") : ""
    );
    setTempSpecialFeatures(
      Array.isArray(config.specialFeatures) ? config.specialFeatures.join("\n") : ""
    );
    setTempRecording(
      Array.isArray(config.recording) ? config.recording.join("\n") : ""
    );
    setTempVideo(Array.isArray(config.video) ? config.video.join("\n") : "");
    setTempAudio(Array.isArray(config.audio) ? config.audio.join("\n") : "");
    setTempWifi(Array.isArray(config.wifi) ? config.wifi.join("\n") : "");
    setTempGps(Array.isArray(config.gps) ? config.gps.join("\n") : "");
    setTempBluetooth(
      Array.isArray(config.bluetooth) ? config.bluetooth.join("\n") : ""
    );
    setTempOtherConnectivity(
      Array.isArray(config.otherConnectivity) ? config.otherConnectivity.join("\n") : ""
    );
  }, [config]);

  // Hàm xử lý blur cho các trường mảng
  const handleArrayBlur = (field: keyof PhoneConfig, value: string) => {
    const arrayValue = value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item !== "");
    onArrayUpdate(field, arrayValue);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-md shadow-sm">
      <h6 className="text-lg font-semibold text-gray-800 mb-2">Cấu hình điện thoại</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cấu hình & Bộ nhớ */}
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
            placeholder="Ví dụ: 3.46 GHz"
          />
        </div>
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
            placeholder="Ví dụ: GPU 5 nhân"
          />
        </div>
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
            placeholder="Ví dụ: 6 GB"
          />
        </div>
        <div>
          <label htmlFor="storage" className="block text-gray-700 font-medium mb-1">
            Bộ nhớ trong
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
            placeholder="Ví dụ: 110 GB"
          />
        </div>
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

        {/* Camera & Màn hình */}
        <div>
          <label htmlFor="rearCameraResolution" className="block text-gray-700 font-medium mb-1">
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
        <div>
          <label htmlFor="rearVideoRecording" className="block text-gray-700 font-medium mb-1">
            Quay video camera sau
          </label>
          <textarea
            id="rearVideoRecording"
            value={tempRearVideoRecording}
            onChange={(e) => setTempRearVideoRecording(e.target.value)}
            onBlur={() => handleArrayBlur("rearVideoRecording", tempRearVideoRecording)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: 4K 2160p@60fps, FullHD 1080p@30fps"
          />
        </div>
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
            placeholder="Ví dụ: Dual LED"
          />
        </div>
        <div>
          <label htmlFor="rearCameraFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng camera sau
          </label>
          <textarea
            id="rearCameraFeatures"
            value={tempRearCameraFeatures}
            onChange={(e) => setTempRearCameraFeatures(e.target.value)}
            onBlur={() => handleArrayBlur("rearCameraFeatures", tempRearCameraFeatures)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Chụp góc rộng, Chụp đêm"
          />
        </div>
        <div>
          <label htmlFor="frontCameraResolution" className="block text-gray-700 font-medium mb-1">
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
        <div>
          <label htmlFor="frontCameraFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng camera trước
          </label>
          <textarea
            id="frontCameraFeatures"
            value={tempFrontCameraFeatures}
            onChange={(e) => setTempFrontCameraFeatures(e.target.value)}
            onBlur={() => handleArrayBlur("frontCameraFeatures", tempFrontCameraFeatures)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Góc rộng, Nhận diện khuôn mặt"
          />
        </div>
        <div>
          <label htmlFor="displayTechnology" className="block text-gray-700 font-medium mb-1">
            Công nghệ màn hình
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
        <div>
          <label htmlFor="displayResolution" className="block text-gray-700 font-medium mb-1">
            Độ phân giải màn hình
          </label>
          <input
            type="text"
            id="displayResolution"
            value={config.displayResolution || ""}
            onChange={(e) => onChange(e, "displayResolution")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 2796 x 1290"
          />
        </div>
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
            placeholder="Ví dụ: 6.7 inch"
          />
        </div>
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
            placeholder="Ví dụ: 2000 nits"
          />
        </div>
        <div>
          <label htmlFor="screenProtection" className="block text-gray-700 font-medium mb-1">
            Bảo vệ màn hình
          </label>
          <input
            type="text"
            id="screenProtection"
            value={config.screenProtection || ""}
            onChange={(e) => onChange(e, "screenProtection")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Ceramic Shield"
          />
        </div>

        {/* Pin & Sạc */}
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
        <div>
          <label htmlFor="maxChargingPower" className="block text-gray-700 font-medium mb-1">
            Công suất sạc tối đa
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
        <div>
          <label htmlFor="batteryFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng pin
          </label>
          <textarea
            id="batteryFeatures"
            value={tempBatteryFeatures}
            onChange={(e) => setTempBatteryFeatures(e.target.value)}
            onBlur={() => handleArrayBlur("batteryFeatures", tempBatteryFeatures)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Tiết kiệm pin, Sạc pin nhanh"
          />
        </div>

        {/* Tiện ích */}
        <div>
          <label htmlFor="securityFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng bảo mật
          </label>
          <textarea
            id="securityFeatures"
            value={tempSecurityFeatures}
            onChange={(e) => setTempSecurityFeatures(e.target.value)}
            onBlur={() => handleArrayBlur("securityFeatures", tempSecurityFeatures)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Mở khóa khuôn mặt Face ID"
          />
        </div>
        <div>
          <label htmlFor="specialFeatures" className="block text-gray-700 font-medium mb-1">
            Tính năng đặc biệt
          </label>
          <textarea
            id="specialFeatures"
            value={tempSpecialFeatures}
            onChange={(e) => setTempSpecialFeatures(e.target.value)}
            onBlur={() => handleArrayBlur("specialFeatures", tempSpecialFeatures)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Hỗ trợ Apple Pencil, Chống nước"
          />
        </div>
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
        <div>
          <label htmlFor="recording" className="block text-gray-700 font-medium mb-1">
            Ghi âm
          </label>
          <textarea
            id="recording"
            value={tempRecording}
            onChange={(e) => setTempRecording(e.target.value)}
            onBlur={() => handleArrayBlur("recording", tempRecording)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Ghi âm cuộc gọi, Ghi âm stereo"
          />
        </div>
        <div>
          <label htmlFor="video" className="block text-gray-700 font-medium mb-1">
            Video
          </label>
          <textarea
            id="video"
            value={tempVideo}
            onChange={(e) => setTempVideo(e.target.value)}
            onBlur={() => handleArrayBlur("video", tempVideo)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Hỗ trợ video HDR, Quay slow-motion"
          />
        </div>
        <div>
          <label htmlFor="audio" className="block text-gray-700 font-medium mb-1">
            Âm thanh
          </label>
          <textarea
            id="audio"
            value={tempAudio}
            onChange={(e) => setTempAudio(e.target.value)}
            onBlur={() => handleArrayBlur("audio", tempAudio)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Loa stereo, Hỗ trợ Dolby Atmos"
          />
        </div>

        {/* Kết nối */}
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
        <div>
          <label htmlFor="wifi" className="block text-gray-700 font-medium mb-1">
            Wi-Fi
          </label>
          <textarea
            id="wifi"
            value={tempWifi}
            onChange={(e) => setTempWifi(e.target.value)}
            onBlur={() => handleArrayBlur("wifi", tempWifi)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Wi-Fi MIMO, Wi-Fi 6"
          />
        </div>
        <div>
          <label htmlFor="gps" className="block text-gray-700 font-medium mb-1">
            GPS
          </label>
          <textarea
            id="gps"
            value={tempGps}
            onChange={(e) => setTempGps(e.target.value)}
            onBlur={() => handleArrayBlur("gps", tempGps)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: GPS, GLONASS"
          />
        </div>
        <div>
          <label htmlFor="bluetooth" className="block text-gray-700 font-medium mb-1">
            Bluetooth
          </label>
          <textarea
            id="bluetooth"
            value={tempBluetooth}
            onChange={(e) => setTempBluetooth(e.target.value)}
            onBlur={() => handleArrayBlur("bluetooth", tempBluetooth)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: Bluetooth 5.3"
          />
        </div>
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
            placeholder="Ví dụ: USB-C"
          />
        </div>
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
            placeholder="Ví dụ: Không hỗ trợ"
          />
        </div>
        <div>
          <label htmlFor="otherConnectivity" className="block text-gray-700 font-medium mb-1">
            Kết nối khác
          </label>
          <textarea
            id="otherConnectivity"
            value={tempOtherConnectivity}
            onChange={(e) => setTempOtherConnectivity(e.target.value)}
            onBlur={() => handleArrayBlur("otherConnectivity", tempOtherConnectivity)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Ví dụ: NFC, UWB"
          />
        </div>

        {/* Thiết kế & Chất liệu */}
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
            placeholder="Ví dụ: Khung thép không gỉ, Mặt lưng kính"
          />
        </div>
        <div>
          <label htmlFor="sizeWeight" className="block text-gray-700 font-medium mb-1">
            Kích thước & Trọng lượng
          </label>
          <input
            type="text"
            id="sizeWeight"
            value={config.sizeWeight || ""}
            onChange={(e) => onChange(e, "sizeWeight")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 162.1 x 77.6 x 8.25 mm, 240g"
          />
        </div>
        <div>
          <label htmlFor="release" className="block text-gray-700 font-medium mb-1">
            Ngày ra mắt
          </label>
          <input
            type="text"
            id="release"
            value={config.release || ""}
            onChange={(e) => onChange(e, "release")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: 09/2024"
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneConfigForm;