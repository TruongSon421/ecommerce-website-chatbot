import React, { useState, useEffect } from "react";
import { AudioConfig } from "../../../types/product";

interface AudioConfigFormProps {
  config: AudioConfig;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof AudioConfig
  ) => void;
  onArrayUpdate: (field: keyof AudioConfig, arrayValue: string[]) => void;
}

const AudioConfigForm: React.FC<AudioConfigFormProps> = ({ config, onChange, onArrayUpdate }) => {
  // Trạng thái tạm thời cho các trường mảng
  const [tempAudioTechnology, setTempAudioTechnology] = useState<string>("");
  const [tempCodecSupport, setTempCodecSupport] = useState<string>("");
  const [tempCompatibility, setTempCompatibility] = useState<string>("");
  const [tempTouchControls, setTempTouchControls] = useState<string>("");
  const [tempVoiceAssistant, setTempVoiceAssistant] = useState<string>("");
  const [tempNoiseCancellation, setTempNoiseCancellation] = useState<string>("");
  const [tempFeatures, setTempFeatures] = useState<string>("");
  const [tempMaterials, setTempMaterials] = useState<string>("");

  // Cập nhật trạng thái ban đầu từ config
  useEffect(() => {
    setTempAudioTechnology(Array.isArray(config.audioTechnology) ? config.audioTechnology.join("\n") : "");
    setTempCodecSupport(Array.isArray(config.codecSupport) ? config.codecSupport.join("\n") : "");
    setTempCompatibility(Array.isArray(config.compatibility) ? config.compatibility.join("\n") : "");
    setTempTouchControls(Array.isArray(config.touchControls) ? config.touchControls.join("\n") : "");
    setTempVoiceAssistant(Array.isArray(config.voiceAssistant) ? config.voiceAssistant.join("\n") : "");
    setTempNoiseCancellation(Array.isArray(config.noiseCancellation) ? config.noiseCancellation.join("\n") : "");
    setTempFeatures(Array.isArray(config.features) ? config.features.join("\n") : "");
    setTempMaterials(Array.isArray(config.materials) ? config.materials.join("\n") : "");
  }, [config]);

  // Hàm xử lý blur cho các trường mảng
  const handleArrayBlur = (field: keyof AudioConfig, value: string) => {
    const arrayValue = value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item !== "");
    onArrayUpdate(field, arrayValue);
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-md shadow-sm">
      <h6 className="text-lg font-semibold text-gray-800 mb-4">Cấu hình Audio</h6>
      
      {/* Pin và sạc */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Pin và sạc</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="earbudsBatteryLife" className="block text-gray-700 font-medium mb-1">
              Thời lượng pin tai nghe
            </label>
            <input
              type="text"
              id="earbudsBatteryLife"
              value={config.earbudsBatteryLife || ""}
              onChange={(e) => onChange(e, "earbudsBatteryLife")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Dùng 12 giờ - Sạc Khoảng 1 giờ"
            />
          </div>
          <div>
            <label htmlFor="chargingCaseBatteryLife" className="block text-gray-700 font-medium mb-1">
              Thời lượng pin hộp sạc
            </label>
            <input
              type="text"
              id="chargingCaseBatteryLife"
              value={config.chargingCaseBatteryLife || ""}
              onChange={(e) => onChange(e, "chargingCaseBatteryLife")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Dùng 54 giờ - Sạc Khoảng 2 giờ"
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
              placeholder="Ví dụ: Type-C"
            />
          </div>
          <div>
            <label htmlFor="fastCharging" className="block text-gray-700 font-medium mb-1">
              Sạc nhanh
            </label>
            <input
              type="text"
              id="fastCharging"
              value={config.fastCharging || ""}
              onChange={(e) => onChange(e, "fastCharging")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 15 phút sạc cho 3 giờ"
            />
          </div>
        </div>
      </div>

      {/* Công nghệ âm thanh */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Công nghệ âm thanh</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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
              placeholder="Ví dụ: Personalized EQ&#10;Dynamic Driver 12.4 mm&#10;Công nghệ ENC"
            />
          </div>
          <div>
            <label htmlFor="driverSize" className="block text-gray-700 font-medium mb-1">
              Kích thước driver
            </label>
            <input
              type="text"
              id="driverSize"
              value={config.driverSize || ""}
              onChange={(e) => onChange(e, "driverSize")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 12.4 mm"
            />
          </div>
          <div>
            <label htmlFor="frequencyResponse" className="block text-gray-700 font-medium mb-1">
              Đáp ứng tần số
            </label>
            <input
              type="text"
              id="frequencyResponse"
              value={config.frequencyResponse || ""}
              onChange={(e) => onChange(e, "frequencyResponse")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 20Hz - 20kHz"
            />
          </div>
          <div>
            <label htmlFor="impedance" className="block text-gray-700 font-medium mb-1">
              Trở kháng
            </label>
            <input
              type="text"
              id="impedance"
              value={config.impedance || ""}
              onChange={(e) => onChange(e, "impedance")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 32 Ohm"
            />
          </div>
          <div>
            <label htmlFor="sensitivity" className="block text-gray-700 font-medium mb-1">
              Độ nhạy
            </label>
            <input
              type="text"
              id="sensitivity"
              value={config.sensitivity || ""}
              onChange={(e) => onChange(e, "sensitivity")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 107 dB"
            />
          </div>
        </div>
      </div>

      {/* Kết nối và tương thích */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Kết nối và tương thích</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bluetoothVersion" className="block text-gray-700 font-medium mb-1">
              Công nghệ kết nối
            </label>
            <input
              type="text"
              id="bluetoothVersion"
              value={config.bluetoothVersion || ""}
              onChange={(e) => onChange(e, "bluetoothVersion")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Bluetooth 5.4"
            />
          </div>
          <div>
            <label htmlFor="multiDeviceConnection" className="block text-gray-700 font-medium mb-1">
              Kết nối cùng lúc
            </label>
            <input
              type="text"
              id="multiDeviceConnection"
              value={config.multiDeviceConnection || ""}
              onChange={(e) => onChange(e, "multiDeviceConnection")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 2 thiết bị"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="codecSupport" className="block text-gray-700 font-medium mb-1">
              Codec hỗ trợ
            </label>
            <textarea
              id="codecSupport"
              value={tempCodecSupport}
              onChange={(e) => setTempCodecSupport(e.target.value)}
              onBlur={() => handleArrayBlur("codecSupport", tempCodecSupport)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ví dụ: SBC&#10;AAC&#10;LDAC"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="compatibility" className="block text-gray-700 font-medium mb-1">
              Tương thích
            </label>
            <textarea
              id="compatibility"
              value={tempCompatibility}
              onChange={(e) => setTempCompatibility(e.target.value)}
              onBlur={() => handleArrayBlur("compatibility", tempCompatibility)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ví dụ: macOS&#10;Android, iOS, Windows"
            />
          </div>
          <div>
            <label htmlFor="connectivityApp" className="block text-gray-700 font-medium mb-1">
              Ứng dụng kết nối
            </label>
            <input
              type="text"
              id="connectivityApp"
              value={config.connectivityApp || ""}
              onChange={(e) => onChange(e, "connectivityApp")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: HeyMelody App"
            />
          </div>
        </div>
      </div>

      {/* Tính năng điều khiển */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Tính năng điều khiển</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="controls" className="block text-gray-700 font-medium mb-1">
              Điều khiển
            </label>
            <input
              type="text"
              id="controls"
              value={Array.isArray(config.controls) ? config.controls.join(", ") : config.controls || ""}
              onChange={(e) => {
                const value = e.target.value;
                const array = value.split(",").map(item => item.trim()).filter(item => item);
                onArrayUpdate("controls", array);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Cảm ứng"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="touchControls" className="block text-gray-700 font-medium mb-1">
              Phím điều khiển
            </label>
            <textarea
              id="touchControls"
              value={tempTouchControls}
              onChange={(e) => setTempTouchControls(e.target.value)}
              onBlur={() => handleArrayBlur("touchControls", tempTouchControls)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ví dụ: Phát/dừng chơi nhạc&#10;Chuyển bài hát&#10;Nhận/Ngắt cuộc gọi"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="voiceAssistant" className="block text-gray-700 font-medium mb-1">
              Tương thích trợ lý ảo
            </label>
            <textarea
              id="voiceAssistant"
              value={tempVoiceAssistant}
              onChange={(e) => setTempVoiceAssistant(e.target.value)}
              onBlur={() => handleArrayBlur("voiceAssistant", tempVoiceAssistant)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ví dụ: Google Assistant&#10;Siri&#10;Alexa"
            />
          </div>
        </div>
      </div>

      {/* Tính năng đặc biệt */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Tính năng đặc biệt</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="features" className="block text-gray-700 font-medium mb-1">
              Tiện ích
            </label>
            <textarea
              id="features"
              value={tempFeatures}
              onChange={(e) => setTempFeatures(e.target.value)}
              onBlur={() => handleArrayBlur("features", tempFeatures)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Ví dụ: Mic khử tiếng ồn&#10;Chống nước & bụi IP55&#10;Có mic thoại&#10;Sạc nhanh&#10;Chống ồn&#10;Hỗ trợ Google Fast Pair"
            />
          </div>
          <div>
            <label htmlFor="waterResistance" className="block text-gray-700 font-medium mb-1">
              Kháng nước
            </label>
            <input
              type="text"
              id="waterResistance"
              value={config.waterResistance || ""}
              onChange={(e) => onChange(e, "waterResistance")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: IPX4"
            />
          </div>
          <div>
            <label htmlFor="dustResistance" className="block text-gray-700 font-medium mb-1">
              Kháng bụi
            </label>
            <input
              type="text"
              id="dustResistance"
              value={config.dustResistance || ""}
              onChange={(e) => onChange(e, "dustResistance")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: IP5X"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="noiseCancellation" className="block text-gray-700 font-medium mb-1">
              Chống ồn
            </label>
            <textarea
              id="noiseCancellation"
              value={tempNoiseCancellation}
              onChange={(e) => setTempNoiseCancellation(e.target.value)}
              onBlur={() => handleArrayBlur("noiseCancellation", tempNoiseCancellation)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ví dụ: ANC chủ động&#10;ENC thoại"
            />
          </div>
        </div>
      </div>

      {/* Thiết kế và chất liệu */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Thiết kế và chất liệu</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dimensions" className="block text-gray-700 font-medium mb-1">
              Kích thước
            </label>
            <input
              type="text"
              id="dimensions"
              value={config.dimensions || ""}
              onChange={(e) => onChange(e, "dimensions")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Dài 3.109 cm - Rộng 2.028 cm - Cao 2.329 cm"
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-gray-700 font-medium mb-1">
              Khối lượng
            </label>
            <input
              type="text"
              id="weight"
              value={config.weight || ""}
              onChange={(e) => onChange(e, "weight")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 4.3 g"
            />
          </div>
          <div>
            <label htmlFor="design" className="block text-gray-700 font-medium mb-1">
              Thiết kế
            </label>
            <input
              type="text"
              id="design"
              value={config.design || ""}
              onChange={(e) => onChange(e, "design")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: In-ear"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="materials" className="block text-gray-700 font-medium mb-1">
              Chất liệu
            </label>
            <textarea
              id="materials"
              value={tempMaterials}
              onChange={(e) => setTempMaterials(e.target.value)}
              onBlur={() => handleArrayBlur("materials", tempMaterials)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Ví dụ: Nhựa ABS&#10;Silicone"
            />
          </div>
        </div>
      </div>

      {/* Xuất xứ và thương hiệu */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h6 className="text-md font-semibold text-gray-700 mb-3">Xuất xứ và thương hiệu</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brandOrigin" className="block text-gray-700 font-medium mb-1">
              Thương hiệu của
            </label>
            <input
              type="text"
              id="brandOrigin"
              value={config.brandOrigin || ""}
              onChange={(e) => onChange(e, "brandOrigin")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Trung Quốc"
            />
          </div>
          <div>
            <label htmlFor="manufacturing" className="block text-gray-700 font-medium mb-1">
              Sản xuất tại
            </label>
            <input
              type="text"
              id="manufacturing"
              value={config.manufacturing || ""}
              onChange={(e) => onChange(e, "manufacturing")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Trung Quốc"
            />
          </div>
          <div>
            <label htmlFor="warranty" className="block text-gray-700 font-medium mb-1">
              Bảo hành
            </label>
            <input
              type="text"
              id="warranty"
              value={config.warranty || ""}
              onChange={(e) => onChange(e, "warranty")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 12 tháng"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioConfigForm; 