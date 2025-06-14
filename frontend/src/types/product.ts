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
    config?: PhoneConfig | LaptopConfig; // Không bắt buộc
    promotions?: string[];      // Không bắt buộc
    productReviews?: ProductReview[]; // Không bắt buộc
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