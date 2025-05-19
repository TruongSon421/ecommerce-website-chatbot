// src/types/product.ts
export interface InventoryRequest {
    color: string | null;
    quantity: number;
    originalPrice: string | null;
    currentPrice: string | null;
}

export interface ImageData {
    url: string;
    title: string;
}

export interface PhoneConfig {
    // Cấu hình & Bộ nhớ
    os?: string;
    processor?: string;
    cpuSpeed?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    availableStorage?: string;
    contactLimit?: string;
  
    // Camera & Màn hình
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
  
    // Pin & Sạc
    batteryCapacity?: string;
    batteryType?: string;
    maxChargingPower?: string;
    batteryFeatures?: string[];
  
    // Tiện ích
    securityFeatures?: string[];
    specialFeatures?: string[];
    waterResistance?: string;
    recording?: string[];
    video?: string[];
    audio?: string[];
  
    // Kết nối
    mobileNetwork?: string;
    simType?: string;
    wifi?: string[];
    gps?: string[];
    bluetooth?: string[];
    chargingPort?: string;
    headphoneJack?: string;
    otherConnectivity?: string[];
  
    // Thiết kế & Chất liệu
    designType?: string;
    materials?: string;
    sizeWeight?: string;
    release?: string;
}

export interface LaptopConfig {
    // Bộ xử lý
    processorModel?: string;
    coreCount?: string;
    threadCount?: string;
    cpuSpeed?: string;
    maxCpuSpeed?: string;
  
    // Bộ nhớ RAM, Ổ cứng
    ram?: string;
    ramType?: string;
    ramBusSpeed?: string;
    maxRam?: string;
    storage?: string[];
  
    // Màn hình
    screenSize?: string;
    resolution?: string;
    refreshRate?: string;
    colorGamut?: string[];
    displayTechnology?: string[];
  
    // Đồ họa và Âm thanh
    graphicCard?: string;
    audioTechnology?: string[];
    ports?: string[];
    wirelessConnectivity?: string[];
    webcam?: string;
    otherFeatures?: string[];
    keyboardBacklight?: string;
  
    // Kích thước - Khối lượng - Pin
    size?: string;
    material?: string;
    battery?: string;
    os?: string;
    release?: string;
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
    description: string;
    brand: string;
    category: string;
    images: string[];
    colors: string[];
    variant: string;
    type: string;
    inventories: Inventory[];
}
  
export interface Inventory {
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
    defaultOriginalPrices: (string | null)[];
    defaultCurrentPrices: (string | null)[];
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