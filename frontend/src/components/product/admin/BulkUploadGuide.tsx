import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, FileSpreadsheet, CheckCircle } from "lucide-react";

interface BulkUploadGuideProps {
  productType: "phone" | "laptop" | "wireless_earphone" | "wired_earphone" | "headphone" | "backup_charger" | "cable_charger_hub";
}

const BulkUploadGuide: React.FC<BulkUploadGuideProps> = ({ productType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getProductTypeName = () => {
    switch (productType) {
      case "phone": return "Điện thoại";
      case "laptop": return "Laptop";
      case "wireless_earphone": return "Tai nghe không dây";
      case "wired_earphone": return "Tai nghe có dây";
      case "headphone": return "Headphone";
      case "backup_charger": return "Sạc dự phòng";
      case "cable_charger_hub": return "Hub sạc/Cáp";
      default: return "Sản phẩm";
    }
  };

  const getRequiredFields = () => {
    const commonFields = [
      { field: "variant", description: "Tên biến thể sản phẩm", example: "iPhone 15 128GB", required: true },
      { field: "description", description: "Mô tả sản phẩm", example: "iPhone 15 với màn hình Dynamic Island", required: false },
      { field: "colors", description: "Màu sắc (phân cách bằng dấu phẩy)", example: "Đỏ,Xanh,Vàng", required: true },
      { field: "originalPrice", description: "Giá gốc (VND)", example: "25000000", required: false },
      { field: "currentPrice", description: "Giá hiện tại (VND)", example: "23000000", required: true },
      { field: "quantity", description: "Số lượng tồn kho", example: "50", required: true },
      { field: "warrantyPeriod", description: "Thời hạn bảo hành", example: "12 tháng", required: false },
      { field: "release", description: "Ngày phát hành", example: "2023-09-15", required: false },
    ];

    const phoneSpecificFields = [
      // Basic specs
      { field: "os", description: "Hệ điều hành", example: "iOS 17", required: false },
      { field: "processor", description: "Bộ xử lý", example: "A17 Pro", required: false },
      { field: "cpuSpeed", description: "Tốc độ CPU", example: "3.78 GHz", required: false },
      { field: "gpu", description: "Chip đồ họa", example: "Apple GPU 5-core", required: false },
      { field: "ram", description: "RAM", example: "8GB", required: false },
      { field: "storage", description: "Bộ nhớ trong", example: "128GB", required: false },
      { field: "availableStorage", description: "Bộ nhớ khả dụng", example: "120GB", required: false },
      { field: "contactLimit", description: "Giới hạn danh bạ", example: "Không giới hạn", required: false },
      
      // Camera
      { field: "rearCameraResolution", description: "Camera sau", example: "48MP + 12MP", required: false },
      { field: "rearVideoRecording", description: "Quay video sau (phân cách dấu phẩy)", example: "4K@60fps,1080p@120fps", required: false },
      { field: "rearFlash", description: "Đèn flash sau", example: "True Tone flash", required: false },
      { field: "rearCameraFeatures", description: "Tính năng camera sau (phân cách dấu phẩy)", example: "Night mode,Portrait", required: false },
      { field: "frontCameraResolution", description: "Camera trước", example: "12MP", required: false },
      { field: "frontCameraFeatures", description: "Tính năng camera trước (phân cách dấu phẩy)", example: "Portrait,Night mode", required: false },
      
      // Display
      { field: "displayTechnology", description: "Công nghệ màn hình", example: "Super Retina XDR OLED", required: false },
      { field: "displayResolution", description: "Độ phân giải", example: "2556 x 1179", required: false },
      { field: "screenSize", description: "Kích thước màn hình", example: "6.1 inch", required: false },
      { field: "maxBrightness", description: "Độ sáng tối đa", example: "2000 nits", required: false },
      { field: "screenProtection", description: "Bảo vệ màn hình", example: "Ceramic Shield", required: false },
      
      // Battery
      { field: "batteryCapacity", description: "Dung lượng pin", example: "3349mAh", required: false },
      { field: "batteryType", description: "Loại pin", example: "Li-Ion", required: false },
      { field: "maxChargingPower", description: "Công suất sạc tối đa", example: "20W", required: false },
      { field: "batteryFeatures", description: "Tính năng pin (phân cách dấu phẩy)", example: "Wireless charging,MagSafe", required: false },
      
      // Security & Features
      { field: "securityFeatures", description: "Tính năng bảo mật (phân cách dấu phẩy)", example: "Face ID,Secure Enclave", required: false },
      { field: "specialFeatures", description: "Tính năng đặc biệt (phân cách dấu phẩy)", example: "Dynamic Island,Action Button", required: false },
      { field: "waterResistance", description: "Kháng nước", example: "IP68", required: false },
      
      // Media
      { field: "recording", description: "Ghi âm (phân cách dấu phẩy)", example: "Dolby Vision HDR", required: false },
      { field: "video", description: "Video (phân cách dấu phẩy)", example: "HDR10,Dolby Vision", required: false },
      { field: "audio", description: "Âm thanh (phân cách dấu phẩy)", example: "Spatial Audio,Dolby Atmos", required: false },
      
      // Connectivity
      { field: "mobileNetwork", description: "Mạng di động", example: "5G", required: false },
      { field: "simType", description: "Loại SIM", example: "Nano-SIM + eSIM", required: false },
      { field: "wifi", description: "Wi-Fi (phân cách dấu phẩy)", example: "Wi-Fi 6", required: false },
      { field: "gps", description: "GPS (phân cách dấu phẩy)", example: "GPS,GLONASS,Galileo", required: false },
      { field: "bluetooth", description: "Bluetooth (phân cách dấu phẩy)", example: "Bluetooth 5.3", required: false },
      { field: "chargingPort", description: "Cổng sạc", example: "USB-C", required: false },
      { field: "headphoneJack", description: "Jack tai nghe", example: "Không", required: false },
      { field: "otherConnectivity", description: "Kết nối khác (phân cách dấu phẩy)", example: "NFC,Ultra Wideband", required: false },
      
      // Design
      { field: "designType", description: "Kiểu thiết kế", example: "Thanh nguyên khối", required: false },
      { field: "materials", description: "Chất liệu", example: "Aluminum + Glass", required: false },
      { field: "sizeWeight", description: "Kích thước & trọng lượng", example: "147.6 x 71.6 x 7.8mm, 171g", required: false },
    ];

    const laptopSpecificFields = [
      // Processor
      { field: "processorModel", description: "Model bộ xử lý", example: "Apple M2", required: false },
      { field: "coreCount", description: "Số core", example: "8", required: false },
      { field: "threadCount", description: "Số luồng", example: "8", required: false },
      { field: "cpuSpeed", description: "Tốc độ CPU", example: "2.4 GHz", required: false },
      { field: "maxCpuSpeed", description: "Tốc độ CPU tối đa", example: "3.2 GHz", required: false },
      
      // Memory
      { field: "ram", description: "RAM", example: "8GB", required: false },
      { field: "ramType", description: "Loại RAM", example: "LPDDR5", required: false },
      { field: "ramBusSpeed", description: "Tốc độ bus RAM", example: "6400MHz", required: false },
      { field: "maxRam", description: "RAM tối đa", example: "24GB", required: false },
      { field: "storage", description: "Bộ nhớ (phân cách dấu phẩy)", example: "256GB SSD", required: false },
      
      // Display
      { field: "screenSize", description: "Kích thước màn hình", example: "13.6 inch", required: false },
      { field: "resolution", description: "Độ phân giải", example: "2560 x 1664", required: false },
      { field: "refreshRate", description: "Tần số quét", example: "60Hz", required: false },
      { field: "colorGamut", description: "Độ phủ màu (phân cách dấu phẩy)", example: "P3 wide color", required: false },
      { field: "displayTechnology", description: "Công nghệ màn hình (phân cách dấu phẩy)", example: "Liquid Retina,LED-backlit", required: false },
      { field: "touchScreen", description: "Cảm ứng (phân cách dấu phẩy)", example: "Không", required: false },
      
      // Graphics & Audio
      { field: "graphicCard", description: "Card đồ họa", example: "Apple M2 10-core GPU", required: false },
      { field: "audioTechnology", description: "Công nghệ âm thanh (phân cách dấu phẩy)", example: "Spatial Audio,Dolby Atmos", required: false },
      
      // Connectivity
      { field: "ports", description: "Cổng giao tiếp (phân cách dấu phẩy)", example: "2x Thunderbolt 4,MagSafe 3", required: false },
      { field: "wirelessConnectivity", description: "Kết nối không dây (phân cách dấu phẩy)", example: "Wi-Fi 6,Bluetooth 5.0", required: false },
      { field: "webcam", description: "Webcam", example: "1080p FaceTime HD", required: false },
      
      // Features & Design
      { field: "otherFeatures", description: "Tính năng khác (phân cách dấu phẩy)", example: "Touch ID,Backlit keyboard", required: false },
      { field: "keyboardBacklight", description: "Đèn bàn phím", example: "Có", required: false },
      { field: "size", description: "Kích thước", example: "304.1 x 215 x 11.3mm", required: false },
      { field: "material", description: "Chất liệu", example: "Recycled Aluminum", required: false },
      { field: "battery", description: "Pin", example: "52.6Wh Li-Polymer", required: false },
      { field: "os", description: "Hệ điều hành", example: "macOS Ventura", required: false },
    ];

    const wirelessEarphoneSpecificFields = [
      // WirelessEarphone config
      { field: "batteryLife", description: "Thời lượng pin tai nghe", example: "6 hours", required: false },
      { field: "chargingCaseBatteryLife", description: "Thời lượng pin hộp sạc", example: "30 hours total", required: false },
      { field: "chargingPort", description: "Cổng sạc (phân cách dấu phẩy)", example: "Lightning,USB-C", required: false },
      { field: "audioTechnology", description: "Công nghệ âm thanh (phân cách dấu phẩy)", example: "Spatial Audio,Adaptive EQ", required: false },
      { field: "compatibility", description: "Tương thích (phân cách dấu phẩy)", example: "iOS,macOS,Apple TV", required: false },
      { field: "connectionApp", description: "Ứng dụng kết nối", example: "Settings app", required: false },
      { field: "features", description: "Tính năng (phân cách dấu phẩy)", example: "Find My,Audio Sharing", required: false },
      { field: "simultaneousConnections", description: "Kết nối đồng thời", example: "Automatic switching", required: false },
      { field: "connectionTechnology", description: "Công nghệ kết nối (phân cách dấu phẩy)", example: "Bluetooth 5.3,Apple H2", required: false },
      { field: "controlType", description: "Loại điều khiển (phân cách dấu phẩy)", example: "Force sensor,Touch control", required: false },
      { field: "controlButtons", description: "Nút điều khiển (phân cách dấu phẩy)", example: "Play/Pause,Skip,Volume", required: false },
      { field: "size", description: "Kích thước", example: "30.9 x 21.8 x 24.0mm", required: false },
      { field: "weight", description: "Khối lượng", example: "5.3g per earbud", required: false },
      { field: "brandOrigin", description: "Thương hiệu từ", example: "Apple", required: false },
      { field: "manufactured", description: "Sản xuất tại", example: "China", required: false },
    ];

    const wiredEarphoneSpecificFields = [
      // WiredEarphone config
      { field: "audioTechonology", description: "Công nghệ âm thanh", example: "Apple engineered drivers", required: false },
      { field: "compatibility", description: "Tương thích (phân cách dấu phẩy)", example: "iPhone,iPad,iPod", required: false },
      { field: "audioJack", description: "Jack âm thanh", example: "Lightning connector", required: false },
      { field: "cableLength", description: "Độ dài cáp", example: "1.2m", required: false },
      { field: "features", description: "Tính năng (phân cách dấu phẩy)", example: "Built-in remote,Microphone", required: false },
      { field: "simultaneousConnections", description: "Kết nối đồng thời", example: "Not applicable", required: false },
      { field: "controlType", description: "Loại điều khiển (phân cách dấu phẩy)", example: "Inline remote,Microphone", required: false },
      { field: "controlButtons", description: "Nút điều khiển (phân cách dấu phẩy)", example: "Volume,Play/Pause,Call", required: false },
      { field: "weight", description: "Khối lượng", example: "10g", required: false },
      { field: "brandOrigin", description: "Thương hiệu từ", example: "Apple", required: false },
      { field: "manufactured", description: "Sản xuất tại", example: "China", required: false },
    ];

    const headphoneSpecificFields = [
      // Headphone config
      { field: "batteryLife", description: "Thời lượng pin", example: "20 hours", required: false },
      { field: "chargingPort", description: "Cổng sạc", example: "Lightning", required: false },
      { field: "audioTechnology", description: "Công nghệ âm thanh (phân cách dấu phẩy)", example: "Spatial Audio,Active Noise Cancellation", required: false },
      { field: "compatibility", description: "Tương thích (phân cách dấu phẩy)", example: "iOS,macOS,Apple TV", required: false },
      { field: "connectionApp", description: "Ứng dụng kết nối", example: "Settings app", required: false },
      { field: "audioJack", description: "Jack âm thanh", example: "3.5mm to Lightning cable", required: false },
      { field: "cableLength", description: "Độ dài cáp", example: "1.2m", required: false },
      { field: "features", description: "Tính năng (phân cách dấu phẩy)", example: "Transparency mode,Find My", required: false },
      { field: "simultaneousConnections", description: "Kết nối đồng thời", example: "Automatic switching", required: false },
      { field: "connectionTechnology", description: "Công nghệ kết nối (phân cách dấu phẩy)", example: "Bluetooth 5.0,Apple H1", required: false },
      { field: "controlType", description: "Loại điều khiển (phân cách dấu phẩy)", example: "Digital Crown,Noise Control button", required: false },
      { field: "controlButtons", description: "Nút điều khiển (phân cách dấu phẩy)", example: "Play/Pause,Skip,Volume,ANC", required: false },
      { field: "size", description: "Kích thước", example: "187.3 x 168.6 x 83.4mm", required: false },
      { field: "weight", description: "Khối lượng", example: "384.8g", required: false },
      { field: "brandOrigin", description: "Thương hiệu từ", example: "Apple", required: false },
      { field: "manufactured", description: "Sản xuất tại", example: "China", required: false },
    ];

    const backupChargerSpecificFields = [
      // BackupCharger config
      { field: "batteryCapacity", description: "Dung lượng pin", example: "10000mAh", required: false },
      { field: "chargingEfficiency", description: "Hiệu suất sạc", example: "85%", required: false },
      { field: "batteryCellType", description: "Loại pin", example: "Li-Polymer", required: false },
      { field: "technologyFeatures", description: "Công nghệ/Tiện ích (phân cách dấu phẩy)", example: "PowerIQ 3.0,Trickle-Charging Mode", required: false },
      { field: "chargingTime", description: "Thời gian sạc (phân cách dấu phẩy)", example: "5-6 giờ (2A),3-4 giờ (3A)", required: false },
      { field: "output", description: "Nguồn ra/Output (phân cách dấu phẩy)", example: "USB-A: 5V⎓2.4A,USB-C: 5V⎓3A", required: false },
      { field: "input", description: "Nguồn vào/Input (phân cách dấu phẩy)", example: "USB-C: 5V⎓2A", required: false },
      { field: "size", description: "Kích thước", example: "9.2 x 6.0 x 2.2 cm", required: false },
      { field: "weight", description: "Khối lượng", example: "180g", required: false },
      { field: "brandOrigin", description: "Thương hiệu từ", example: "Anker", required: false },
      { field: "manufactured", description: "Sản xuất tại", example: "China", required: false },
    ];

    const cableChargerHubSpecificFields = [
      // CableChargerHub config
      { field: "model", description: "Model sản phẩm", example: "PowerExpand 7-in-1", required: false },
      { field: "features", description: "Tính năng (phân cách dấu phẩy)", example: "4K HDMI,Fast Charging,Data Transfer", required: false },
      { field: "input", description: "Nguồn vào (phân cách dấu phẩy)", example: "USB-C", required: false },
      { field: "output", description: "Nguồn ra (phân cách dấu phẩy)", example: "HDMI,2x USB-A,USB-C,SD Card", required: false },
      { field: "maximumCharging", description: "Sạc tối đa", example: "100W", required: false },
      { field: "size", description: "Kích thước", example: "11.2 x 4.5 x 1.3 cm", required: false },
      { field: "technologyFeatures", description: "Công nghệ (phân cách dấu phẩy)", example: "Power Delivery 3.0,USB 3.0,4K@60Hz", required: false },
      { field: "manufactured", description: "Sản xuất tại", example: "China", required: false },
      { field: "brandOrigin", description: "Thương hiệu từ", example: "Anker", required: false },
      { field: "connectionJack", description: "Cổng kết nối (phân cách dấu phẩy)", example: "USB-C,HDMI,USB-A,SD,microSD", required: false },
      { field: "maximumPower", description: "Công suất tối đa", example: "100W", required: false },
      { field: "length", description: "Độ dài", example: "15cm cable", required: false },
    ];

    const getFieldsByType = () => {
      switch (productType) {
        case "phone": return phoneSpecificFields;
        case "laptop": return laptopSpecificFields;
        case "wireless_earphone": return wirelessEarphoneSpecificFields;
        case "wired_earphone": return wiredEarphoneSpecificFields;
        case "headphone": return headphoneSpecificFields;
        case "backup_charger": return backupChargerSpecificFields;
        case "cable_charger_hub": return cableChargerHubSpecificFields;
        default: return [];
      }
    };

    return [
      ...commonFields,
      ...getFieldsByType()
    ];
  };

  const getValidationRules = () => [
    "Variant không được để trống",
    "Colors phải có ít nhất 1 màu sắc",
    "CurrentPrice phải là số nguyên dương",
    "Quantity phải là số nguyên dương",
    "OriginalPrice (nếu có) phải lớn hơn hoặc bằng currentPrice",
    "Màu sắc phân cách bằng dấu phẩy, không có khoảng trống thừa",
    "Giá trị số không chứa ký tự đặc biệt (dấu phẩy, chấm)",
    "Các trường array (có ghi chú 'phân cách dấu phẩy') cần format: item1,item2,item3",
    "Các trường cấu hình kỹ thuật đều không bắt buộc, có thể để trống",
    "Nếu điền thông tin kỹ thuật, hãy đảm bảo chính xác về mặt kỹ thuật",
    "Dữ liệu sẽ được parse tự động thành đúng format cho hệ thống"
  ];

  const getStepByStepGuide = () => [
    {
      step: 1,
      title: "Chuẩn bị dữ liệu",
      description: "Tập hợp thông tin tất cả sản phẩm cần thêm vào nhóm"
    },
    {
      step: 2,
      title: "Tải template",
      description: "Click nút 'Tải template' để download file mẫu với đúng format"
    },
    {
      step: 3,
      title: "Điền thông tin",
      description: "Mở file template và điền thông tin sản phẩm theo từng cột"
    },
    {
      step: 4,
      title: "Kiểm tra dữ liệu",
      description: "Đảm bảo tất cả trường bắt buộc đã được điền đúng format"
    },
    {
      step: 5,
      title: "Upload file",
      description: "Kéo thả hoặc chọn file để upload lên hệ thống"
    },
    {
      step: 6,
      title: "Xem preview",
      description: "Kiểm tra thông tin trong phần preview trước khi xác nhận"
    },
    {
      step: 7,
      title: "Xác nhận",
      description: "Click 'Xác nhận thêm vào nhóm' để hoàn tất quá trình"
    }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="text-blue-600" size={20} />
          <h4 className="font-semibold text-blue-800">
            Hướng dẫn upload hàng loạt ({getProductTypeName()})
          </h4>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-blue-600" size={20} />
        ) : (
          <ChevronDown className="text-blue-600" size={20} />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          {/* Các bước thực hiện */}
          <div>
            <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <CheckCircle size={16} />
              Các bước thực hiện
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getStepByStepGuide().map((item) => (
                <div key={item.step} className="flex gap-3 p-3 bg-white rounded-md">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bảng các trường dữ liệu */}
          <div>
            <h5 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <FileSpreadsheet size={16} />
              Các trường dữ liệu trong file Excel/CSV
            </h5>
            <div className="bg-white rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Tên trường</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Mô tả</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Ví dụ</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-900">Bắt buộc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getRequiredFields().map((field, index) => (
                      <tr key={index} className={field.required ? "bg-yellow-50" : ""}>
                        <td className="px-3 py-2 font-mono text-blue-700">{field.field}</td>
                        <td className="px-3 py-2 text-gray-700">{field.description}</td>
                        <td className="px-3 py-2 font-mono text-green-700">{field.example}</td>
                        <td className="px-3 py-2 text-center">
                          {field.required ? (
                            <span className="text-red-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-400">○</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quy tắc validation */}
          <div>
            <h5 className="font-medium text-blue-800 mb-3">Quy tắc validation</h5>
            <ul className="space-y-1">
              {getValidationRules().map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                  <span className="text-blue-600 mt-1">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Lưu ý quan trọng */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <h6 className="font-medium text-yellow-800 mb-2">⚠️ Lưu ý quan trọng</h6>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• File CSV có thể mở bằng Excel, Google Sheets hoặc text editor</li>
              <li>• Đảm bảo encoding UTF-8 để hiển thị đúng tiếng Việt</li>
              <li>• Không thay đổi tên cột trong file template</li>
              <li>• Kiểm tra kỹ dữ liệu trước khi upload để tránh lỗi</li>
              <li>• Nếu có lỗi, hệ thống sẽ hiển thị chi tiết từng dòng bị lỗi</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadGuide; 