// src/types/product.ts
export interface InventoryRequest {
    color: string | null;
    quantity: number;
    originalPrice: number | null;
    currentPrice: number | null;
}

export interface ImageData {
    url: string;
    title: string;
}

export interface Variant {
  productId: string;
  variant: string;
}

export interface GroupVariantResponse {
  groupId: number | null;
  groupName: string | null;
  variants: Variant[];
}

export interface PhoneConfig {
  os?: string;
  processor?: string;
  cpuSpeed?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  availableStorage?: string;
  contactLimit?: string;
  rearCameraResolution?: string;
  rearVideoRecording?: string[];
  rearFlash?: string;
  rearCameraFeatures?: string[];
  frontCameraResolution?: string;
  frontCameraFeatures?: string[];
  displayTechnology?: string;
  displayResolution?: string;
  screenSize?: string;
  maxBrightness?: string;
  screenProtection?: string;
  batteryCapacity?: string; 
  batteryType?: string;
  maxChargingPower?: string;
  batteryFeatures?: string[];
  securityFeatures?: string[];
  specialFeatures?: string[];
  waterResistance?: string;
  recording?: string[];
  video?: string[];
  audio?: string[];
  mobileNetwork?: string;
  simType?: string;
  wifi?: string[];
  gps?: string[];
  bluetooth?: string[];
  chargingPort?: string;
  headphoneJack?: string;
  otherConnectivity?: string[];
  designType?: string;
  materials?: string;
  sizeWeight?: string;
}

export interface LaptopConfig {
  processorModel?: string; // công nghệ cpu
  coreCount?: string; // số core
  threadCount?: string; // số luồng
  cpuSpeed?: string; // tốc độ cpu
  maxCpuSpeed?: string; // tốc độ tối đa
  ram?: string;
  ramType?: string;
  ramBusSpeed?: string;
  maxRam?: string;
  storage?: string[];
  screenSize?: string;
  resolution?: string;
  refreshRate?: string; // tần số quét
  colorGamut?: string[]; // độ phủ màu
  displayTechnology?: string[]; // công nghệ màn hình
  touchScreen?: string[]; // cảm ứng màn hình
  graphicCard?: string; // card màn hình
  audioTechnology?: string[]; // công nghệ âm thanh
  ports?: string[]; // cổng giao tiếp
  wirelessConnectivity?: string[]; // kết nối không dây
  webcam?: string;
  otherFeatures?: string[];
  keyboardBacklight?: string;
  size?: string;
  material?: string;
  battery?: string;
  os?: string;
}

<<<<<<< HEAD
export interface AudioConfig {
  // Pin và sạc
  earbudsBatteryLife?: string; // thời lượng pin tai nghe
  chargingCaseBatteryLife?: string; // thời lượng pin hộp sạc
  chargingPort?: string; // cổng sạc
  chargingTime?: string; // thời gian sạc
  fastCharging?: string; // sạc nhanh

  // Công nghệ âm thanh
  audioTechnology?: string[]; // công nghệ âm thanh
  driverSize?: string; // kích thước driver
  frequencyResponse?: string; // đáp ứng tần số
  impedance?: string; // trở kháng
  sensitivity?: string; // độ nhạy
  soundProfile?: string[]; // profile âm thanh

  // Kết nối và tương thích
  bluetoothVersion?: string; // phiên bản bluetooth
  codecSupport?: string[]; // codec hỗ trợ
  wirelessRange?: string; // phạm vi kết nối
  multiDeviceConnection?: string; // kết nối đa thiết bị
  compatibility?: string[]; // tương thích
  connectivityApp?: string; // ứng dụng kết nối

  // Tính năng điều khiển
  controls?: string[]; // điều khiển
  touchControls?: string[]; // điều khiển cảm ứng
  voiceAssistant?: string[]; // trợ lý ảo
  customization?: string[]; // tùy chỉnh

  // Tính năng đặc biệt
  noiseCancellation?: string[]; // chống ồn
  transparency?: string; // chế độ trong suốt
  waterResistance?: string; // kháng nước
  dustResistance?: string; // kháng bụi
  microphone?: string[]; // microphone
  features?: string[]; // tính năng khác

  // Thiết kế và chất liệu
  design?: string; // thiết kế
  materials?: string[]; // chất liệu
  weight?: string; // khối lượng
  dimensions?: string; // kích thước
  colors?: string[]; // màu sắc có sẵn

  // Xuất xứ và thương hiệu
  brandOrigin?: string; // thương hiệu của
  manufacturing?: string; // sản xuất tại
  warranty?: string; // bảo hành
}

=======
export interface WirelessEarphoneConfig {
  batteryLife?: string;
  chargingCaseBatteryLife?: string;
  chargingPort?: string[];
  audioTechnology?: string[];
  compatibility?: string[];
  connectionApp?: string[];
  features?: string[];
  simultaneousConnections?: string;
  connectionTechnology?: string[];
  controlType?: string[];
  controlButtons?: string[];
  size?: string;
  weight?: string;
  brandOrigin?: string;
  manufactured?: string;
}

export interface WiredEarphoneConfig {
  audioTechonology?: string[]; // Note: Typo maintained to match backend
  compatibility?: string[];
  audioJack?: string;
  cableLength?: string;
  features?: string[];
  simultaneousConnections?: string;
  controlType?: string[];
  controlButtons?: string[];
  weight?: string;
  brandOrigin?: string;
  manufactured?: string;
}

export interface HeadphoneConfig {
  batteryLife?: string;
  chargingPort?: string;
  audioTechnology?: string[];
  compatibility?: string[];
  connectionApp?: string;
  audioJack?: string;
  cableLength?: string;
  features?: string[];
  simultaneousConnections?: string;
  connectionTechnology?: string[];
  controlType?: string[];
  controlButtons?: string[];
  size?: string;
  weight?: string;
  brandOrigin?: string;
  manufactured?: string;
}

export interface BackupChargerConfig {
  batteryCapacity?: string; // dung lượng pin
  chargingEfficiency?: string; // hiệu suất sạc
  batteryCellType?: string; // loại pin
  technologyFeatures?: string[]; // công nghệ / tiện ích
  chargingTime?: string[]; // thời gian sạc đầy pin
  output?: string[]; // nguồn ra
  input?: string[]; // nguồn vào
  size?: string; // kích thước
  weight?: string; // khối lượng
  brandOrigin?: string; // thương hiệu của
  manufactured?: string; // sản xuất tại
}

export interface CableChargerHubConfig {
  model?: string;
  features?: string[]; // thời gian sạc đầy pin
  input?: string[]; // nguồn vào
  output?: string[]; // nguồn ra
  maximumCharging?: string; // dòng sạc tối đa
  size?: string; // kích thước
  technologyFeatures?: string[]; // công nghệ / tiện ích
  manufactured?: string; // sản xuất tại
  brandOrigin?: string; // thương hiệu của
  connectionJack?: string[]; // jack kết nối
  maximumPower?: string; // công suất tối đa
  length?: string;
}

// Union type for all configs
export type ProductConfig = PhoneConfig | LaptopConfig | WirelessEarphoneConfig | WiredEarphoneConfig | HeadphoneConfig | BackupChargerConfig | CableChargerHubConfig;

>>>>>>> server
export interface ProductReview {
    title: string;
    content: string;
}

export interface ProductRequest {
    productName: string;        // Bắt buộc (tạo từ prefixName + variant)
    description: string;        // Có thể để trống, không bắt buộc
    brand: string;              // Bắt buộc       
    images: Record<string, ImageData[]>; // Bắt buộc, ít nhất 1 ảnh cho mỗi màu
    colors: string[];           // Bắt buộc, ít nhất 1 màu
    variant: string;            // Bắt buộc
    type: string;               // Bắt buộc (lấy từ groupData.type)
<<<<<<< HEAD
    config?: PhoneConfig | LaptopConfig | AudioConfig; // Không bắt buộc
    promotions?: string[];      // Không bắt buộc
    productReviews?: ProductReview[]; // Không bắt buộc
=======
    config?: ProductConfig;     // Không bắt buộc - updated to use union type
    promotions?: string[];      // Không bắt buộc
    productReviews?: ProductReview[]; // Không bắt buộc
    warrantyPeriod?: string;    // Thời hạn bảo hành
    release?: string;           // Ngày phát hành
>>>>>>> server
}
  
export interface ProductCreateRequest {
    productRequest: ProductRequest;
    inventoryRequests: InventoryRequest[];
}
  
export interface Product {
  productId: string;
  productName: string;
  description?: string;
  isNew?: boolean;
  brand: string;
  images: Record<string, { url: string; title: string }[]> | null;
  type: string;
  warrantyPeriod?: null;
  productReviews: { title: string; content: string }[];
  promotions: string[];
  release: string;
  original_prices: number[];
  current_prices: number[];
  specifications: { name: string; value: string | string[] }[];
  colors: string[] | null;
  quantities: number[];
}
  
export interface InventoryDto {
    inventoryId: string;
    color: string | null;
    quantity: number;
    originalPrice: string | null;
    currentPrice: string | null;
}
  
export interface GroupVariantRequest {
    productIds: string[];
    image: string | null;
    type: string;
    variants: string[];
    productNames: string[];
    defaultOriginalPrices: (number | null)[];
    defaultCurrentPrices: (number | null)[];
    defaultColors: (string|null)[];
    groupName: string;
    brand: string
}
<<<<<<< HEAD
=======

// Interface matching backend ProductWithInventoryRequest
export interface ProductWithInventoryRequest {
    productRequest: ProductRequest;
    inventoryRequests: InventoryRequest[];
}

// New interface for bulk group creation
export interface BulkGroupCreateRequest {
    groupName: string;
    brand: string;
    type: string;
    image: string | null;
    products: ProductWithInventoryRequest[];  // Match backend ProductWithInventoryRequest
}

export interface BulkGroupCreateResponse {
    success: boolean;
    groupId?: number;
    productIds: string[];
    failedProducts?: string[];
    message: string;
}
>>>>>>> server
  
export interface GroupVariant {
    groupId: string;
    productIds: string[];
    image: string | null;
    type: string;
    variants: string[];
    productNames: string[];
    defaultOriginalPrices: (string | null)[];
    defaultCurrentPrices: (string | null)[];
}

export interface GroupProductDto {
  productId: string;
  variant?: string;
  orderNumber?: number;
  productName: string;
  defaultOriginalPrice: number;
  defaultCurrentPrice: number;
}