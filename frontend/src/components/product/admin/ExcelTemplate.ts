// Template Excel với cấu trúc group và tiếng Việt (Enhanced)
export interface ExcelGroupTemplate {
  // Thông tin nhóm (Group)
  ma_nhom: string;           // Mã nhóm (dùng để gom các sản phẩm cùng group)
  ten_nhom: string;          // Tên nhóm sản phẩm
  thuong_hieu: string;       // Thương hiệu (Brand)
  loai_san_pham: string;     // Loại sản phẩm
  anh_nhom: string;          // Ảnh đại diện cho nhóm
  
  // Thông tin sản phẩm (Product)
  ten_san_pham: string;      // Tên sản phẩm
  bien_the: string;          // Biến thể (variant)
  mo_ta: string;             // Mô tả sản phẩm
  mau_sac: string;           // Màu sắc (cách nhau bằng dấu phẩy)
  mau_kho: string;           // Màu tồn kho cụ thể
  
  // Ảnh sản phẩm (Enhanced)
  anh_san_pham_json: string; // JSON format: {"Đen": [{"url": "...", "title": "..."}]}
  anh_pattern: string;       // Pattern URL: "https://domain.com/{product}-{color}-{index}.jpg"
  
  // Giá và tồn kho
  gia_goc: string;           // Giá gốc
  gia_hien_tai: string;      // Giá hiện tại
  so_luong: string;          // Số lượng tồn kho
  bao_hanh: string;          // Thời hạn bảo hành
  ngay_phat_hanh: string;    // Ngày phát hành
  
  // Khuyến mãi và đánh giá (Enhanced)
  khuyen_mai: string;        // Khuyến mãi (cách nhau bằng dấu |)
  danh_gia_json: string;     // Đánh giá (JSON string array)
  
  // Thông số kỹ thuật (JSON format)
  thong_so_ky_thuat: string; // JSON config cho từng loại sản phẩm
  
  // Thông số kỹ thuật (sẽ khác nhau theo loại sản phẩm)
  [key: string]: string;
}

// Enhanced file row interface for processing
export interface EnhancedFileRow {
  groupName: string;
  brand: string;
  type: string;
  image: string;
  productName: string;
  variant: string;
  description: string;
  colors: string;              // "Đen,Trắng,Xanh"
  inventoryColor: string;      // "Đen"
  quantity: number;
  originalPrice: number;
  currentPrice: number;
  
  // Enhanced fields
  imagesJson?: string;         // JSON string for complex images
  imagePattern?: string;       // URL pattern for auto-generation
  reviewsJson?: string;        // JSON string for reviews
  promotions?: string;         // Pipe-separated promotions
  configJson?: string;         // JSON config for product specs
  warrantyPeriod?: string;     // Warranty period
  releaseDate?: string;        // Release date
}

// Image data structure
export interface ImageData {
  url: string;
  title: string;
  description?: string;
}

// Review data structure  
export interface ProductReviewData {
  title: string;
  content: string;
  rating?: number;
  author?: string;
  date?: string;
}

// Phone template fields (tiếng Việt)
export const phoneTemplateFields = {
  // Cơ bản
  he_dieu_hanh: "Hệ điều hành",
  bo_xu_ly: "Bộ xử lý",
  toc_do_cpu: "Tốc độ CPU",
  chip_do_hoa: "Chip đồ họa",
  ram: "RAM",
  bo_nho_trong: "Bộ nhớ trong",
  bo_nho_kha_dung: "Bộ nhớ khả dụng",
  gioi_han_danh_ba: "Giới hạn danh bạ",
  
  // Camera
  camera_sau: "Camera sau",
  quay_video_sau: "Quay video sau",
  den_flash_sau: "Đèn flash sau",
  tinh_nang_camera_sau: "Tính năng camera sau",
  camera_truoc: "Camera trước",
  tinh_nang_camera_truoc: "Tính năng camera trước",
  
  // Màn hình
  cong_nghe_man_hinh: "Công nghệ màn hình",
  do_phan_giai: "Độ phân giải",
  kich_thuoc_man_hinh: "Kích thước màn hình",
  do_sang_toi_da: "Độ sáng tối đa",
  bao_ve_man_hinh: "Bảo vệ màn hình",
  
  // Pin
  dung_luong_pin: "Dung lượng pin",
  loai_pin: "Loại pin",
  cong_suat_sac_toi_da: "Công suất sạc tối đa",
  tinh_nang_pin: "Tính năng pin",
  
  // Bảo mật & Tính năng
  tinh_nang_bao_mat: "Tính năng bảo mật",
  tinh_nang_dac_biet: "Tính năng đặc biệt",
  khang_nuoc: "Kháng nước",
  
  // Multimedia
  ghi_am: "Ghi âm",
  video: "Video",
  am_thanh: "Âm thanh",
  
  // Kết nối
  mang_di_dong: "Mạng di động",
  loai_sim: "Loại SIM",
  wifi: "Wi-Fi",
  gps: "GPS",
  bluetooth: "Bluetooth",
  cong_sac: "Cổng sạc",
  jack_tai_nghe: "Jack tai nghe",
  ket_noi_khac: "Kết nối khác",
  
  // Thiết kế
  kieu_thiet_ke: "Kiểu thiết kế",
  chat_lieu: "Chất liệu",
  kich_thuoc_trong_luong: "Kích thước & trọng lượng"
};

// Laptop template fields
export const laptopTemplateFields = {
  // Bộ xử lý
  model_bo_xu_ly: "Model bộ xử lý",
  so_core: "Số core",
  so_luong_cpu: "Số luồng CPU", // Thêm "CPU" để phân biệt với "số lượng" sản phẩm
  toc_do_cpu: "Tốc độ CPU",
  toc_do_cpu_toi_da: "Tốc độ CPU tối đa",
  
  // Bộ nhớ
  ram: "RAM",
  loai_ram: "Loại RAM",
  toc_do_bus_ram: "Tốc độ bus RAM",
  ram_toi_da: "RAM tối đa",
  bo_nho: "Bộ nhớ",
  
  // Màn hình
  kich_thuoc_man_hinh: "Kích thước màn hình",
  do_phan_giai: "Độ phân giải",
  tan_so_quet: "Tần số quét",
  do_phu_mau: "Độ phủ màu",
  cong_nghe_man_hinh: "Công nghệ màn hình",
  cam_ung: "Cảm ứng",
  
  // Đồ họa & Âm thanh
  card_do_hoa: "Card đồ họa",
  cong_nghe_am_thanh: "Công nghệ âm thanh",
  
  // Kết nối
  cong_giao_tiep: "Cổng giao tiếp",
  ket_noi_khong_day: "Kết nối không dây",
  webcam: "Webcam",
  
  // Tính năng & Thiết kế
  tinh_nang_khac: "Tính năng khác",
  den_ban_phim: "Đèn bàn phím",
  kich_thuoc: "Kích thước",
  chat_lieu: "Chất liệu",
  pin: "Pin",
  he_dieu_hanh: "Hệ điều hành"
};

// Enhanced template generation with real-world data
export const generateEnhancedExcelTemplate = (productType: string) => {
  const commonGroupData = {
    ma_nhom: "GROUP001",
    thuong_hieu: "Apple", // Will be updated per product type
    loai_san_pham: getProductTypeVietnamese(productType),
    anh_nhom: "https://example.com/group-image.jpg", // Will be updated per product type
  };

  const commonPromotions = [
    "Khuyến mãi trị giá 500.000₫",
    "Giảm giá 10% cho đơn hàng đầu tiên",
    "Thu cũ đổi mới: Giảm đến 2,000,000đ",
    "Miễn phí vận chuyển toàn quốc",
    "Bảo hành mở rộng thêm 6 tháng"
  ];

  if (productType === "phone") {
    const phoneImages = {
      "Đen": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334864/iphone-16e-black-1-638756437699035701-180x125.jpg",
          title: "iPhone 16e 128GB Màu Đen"
        },
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334864/iphone-16e-black-2-638756437705275347-180x125.jpg",
          title: "iPhone 16e 128GB Màu Đen - Mặt sau"
        }
      ],
      "Trắng": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334864/iphone-16e-white-1-638756438035819151-180x125.jpg",
          title: "iPhone 16e 128GB Màu Trắng"
        }
      ]
    };

    const phoneReviews: ProductReviewData[] = [
      {
        title: "Hiệu năng mạnh mẽ với chip A18",
        content: "Chip A18 mang đến hiệu năng vượt trội, xử lý mượt mà mọi tác vụ từ gaming đến chỉnh sửa video.",
        rating: 5,
        author: "TechReview"
      },
      {
        title: "Camera Fusion 48MP ấn tượng",
        content: "Chất lượng ảnh tuyệt vời, đặc biệt trong điều kiện thiếu sáng. Tính năng Portrait mode rất tự nhiên.",
        rating: 4,
        author: "PhotoUser"
      }
    ];

    const phoneConfig = {
      os: "iOS 17",
      processor: "Apple A18",
      cpuSpeed: "3.78 GHz", 
      gpu: "Apple GPU 4-core",
      ram: "8GB",
      storage: "128GB",
      rearCameraResolution: "48MP Camera Fusion",
      frontCameraResolution: "12MP TrueDepth",
      displayTechnology: "Super Retina XDR OLED",
      screenSize: "6.1 inch",
      batteryCapacity: "3349mAh",
      chargingPort: "USB-C",
      waterResistance: "IP68"
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "IPHONE16E001",
        ten_nhom: "iPhone 16e Series",
        thuong_hieu: "Apple",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334864/iphone-16e-group.jpg",
        
        ten_san_pham: "iPhone 16e",
        bien_the: "128GB",
        mo_ta: "iPhone 16e với chip A18, camera Fusion 48MP và thời lượng pin lên đến 26 giờ",
        mau_sac: "Đen,Trắng",
        mau_kho: "Đen",
        
        anh_san_pham_json: JSON.stringify(phoneImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/334864/iphone-16e-{color}-{index}.jpg",
        
        gia_goc: "25000000",
        gia_hien_tai: "23000000",
        so_luong: "50",
        bao_hanh: "12 tháng chính hãng Apple",
        ngay_phat_hanh: "03/2025",
        
        khuyen_mai: commonPromotions.join(" | "),
        danh_gia_json: JSON.stringify(phoneReviews),
        thong_so_ky_thuat: JSON.stringify(phoneConfig)
      }
    ];
  }

  if (productType === "laptop") {
    const laptopImages = {
      "Bạc": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/231244/macbook-pro-14-m3-sliver-1-638398771625805324-550x340.jpg",
          title: "MacBook Pro 14 inch M3 Màu Bạc"
        },
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/231244/macbook-pro-14-m3-sliver-2-638398771631843169-550x340.jpg", 
          title: "MacBook Pro 14 inch M3 Màu Bạc - Góc nghiêng"
        }
      ],
      "Xám": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/231244/macbook-pro-14-m3-gray-1-638398771596218169-550x340.jpg",
          title: "MacBook Pro 14 inch M3 Màu Xám"
        }
      ]
    };

    const laptopReviews: ProductReviewData[] = [
      {
        title: "Hiệu năng M3 vượt trội",
        content: "Chip M3 mang đến hiệu năng tuyệt vời cho công việc đồ họa và lập trình. Render video nhanh hơn 30% so với M2.",
        rating: 5,
        author: "DevExpert"
      },
      {
        title: "Màn hình Liquid Retina XDR tuyệt đẹp",
        content: "Chất lượng màn hình xuất sắc với độ sáng cao và dải màu rộng. Hoàn hảo cho công việc thiết kế.",
        rating: 5,
        author: "Designer Pro"
      }
    ];

    const laptopConfig = {
      processorModel: "Apple M3",
      coreCount: "8",
      threadCount: "8",
      cpuSpeed: "3.5 GHz",
      ram: "16GB",
      ramType: "Unified Memory",
      storage: ["512GB SSD"],
      screenSize: "14.2 inch",
      resolution: "3024x1964",
      displayTechnology: ["Liquid Retina XDR"],
      graphicCard: "Apple M3 10-core GPU",
      audioTechnology: ["6-speaker sound system", "Spatial Audio"],
      ports: ["2x Thunderbolt 4", "MagSafe 3", "3.5mm headphone jack"],
      battery: "70Wh lithium-polymer",
      os: "macOS Ventura"
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "MACBOOKM3001",
        ten_nhom: "MacBook Pro M3 Series",
        thuong_hieu: "Apple",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/231244/macbook-pro-14-m3-group.jpg",
        
        ten_san_pham: "MacBook Pro 14 inch M3",
        bien_the: "512GB",
        mo_ta: "MacBook Pro 14 inch với chip M3, 16GB RAM và SSD 512GB. Hiệu năng mạnh mẽ cho chuyên gia",
        mau_sac: "Bạc,Xám",
        mau_kho: "Bạc",
        
        anh_san_pham_json: JSON.stringify(laptopImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/44/231244/macbook-pro-14-m3-{color}-{index}.jpg",
        
        gia_goc: "55000000",
        gia_hien_tai: "52000000", 
        so_luong: "25",
        bao_hanh: "12 tháng chính hãng Apple",
        ngay_phat_hanh: "11/2023",
        
        khuyen_mai: commonPromotions.join(" | "),
        danh_gia_json: JSON.stringify(laptopReviews),
        thong_so_ky_thuat: JSON.stringify(laptopConfig)
      }
    ];
  }

  if (productType === "wireless_earphone") {
    const earphoneImages = {
      "Trắng": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/289780/airpods-pro-2nd-gen-usb-c-1-638318351093979831-550x340.jpg",
          title: "AirPods Pro 2nd Gen USB-C"
        },
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/289780/airpods-pro-2nd-gen-usb-c-2-638318351099635518-550x340.jpg",
          title: "AirPods Pro 2nd Gen USB-C - Case sạc"
        }
      ]
    };

    const earphoneReviews: ProductReviewData[] = [
      {
        title: "Chống ồn ANC tuyệt vời",
        content: "Công nghệ chống ồn chủ động rất hiệu quả, âm thanh trong trẻo và bass mạnh mẽ.",
        rating: 5,
        author: "AudioFan"
      }
    ];

    const earphoneConfig = {
      batteryLife: "6 giờ",
      chargingCaseBatteryLife: "30 giờ tổng cộng",
      chargingPort: ["USB-C"],
      audioTechnology: ["Spatial Audio", "Adaptive EQ", "Active Noise Cancellation"],
      connectionTechnology: ["Bluetooth 5.3", "Apple H2 chip"],
      controlType: ["Force sensor", "Touch control"],
      features: ["Transparency mode", "Find My", "Sweat and water resistant"]
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "AIRPODSPRO001",
        ten_nhom: "AirPods Pro 2nd Gen",
        thuong_hieu: "Apple",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/289780/airpods-pro-2nd-gen-group.jpg",
        
        ten_san_pham: "AirPods Pro (2nd generation)",
        bien_the: "USB-C",
        mo_ta: "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động và case sạc USB-C",
        mau_sac: "Trắng",
        mau_kho: "Trắng",
        
        anh_san_pham_json: JSON.stringify(earphoneImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/289780/airpods-pro-2nd-gen-{color}-{index}.jpg",
        
        gia_goc: "6500000",
        gia_hien_tai: "6000000",
        so_luong: "100",
        bao_hanh: "12 tháng chính hãng Apple",
        ngay_phat_hanh: "09/2023",
        
        khuyen_mai: commonPromotions.slice(0, 3).join(" | "),
        danh_gia_json: JSON.stringify(earphoneReviews),
        thong_so_ky_thuat: JSON.stringify(earphoneConfig)
      }
    ];
  }

  if (productType === "headphone") {
    const headphoneImages = {
      "Bạc": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/252828/airpods-max-silver-1-638297626602036025-550x340.jpg",
          title: "AirPods Max Màu Bạc"
        }
      ],
      "Xanh": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/252828/airpods-max-blue-1-638297626628815393-550x340.jpg",
          title: "AirPods Max Màu Xanh"
        }
      ]
    };

    const headphoneReviews: ProductReviewData[] = [
      {
        title: "Chất lượng âm thanh Hi-Fi",
        content: "Âm thanh chất lượng cao với driver tùy chỉnh 40mm, bass sâu và treble trong trẻo.",
        rating: 5,
        author: "Audiophile"
      }
    ];

    const headphoneConfig = {
      batteryLife: "20 giờ",
      chargingPort: "Lightning",
      audioTechnology: ["Spatial Audio", "Active Noise Cancellation", "Transparency mode"],
      connectionTechnology: ["Bluetooth 5.0", "Apple H1 chip"],
      controlType: ["Digital Crown", "Noise Control button"],
      features: ["Find My", "Audio Sharing", "Automatic head detection"]
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "AIRPODSMAX001",
        ten_nhom: "AirPods Max",
        thuong_hieu: "Apple",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/252828/airpods-max-group.jpg",
        
        ten_san_pham: "AirPods Max",
        bien_the: "Over-ear",
        mo_ta: "Tai nghe over-ear cao cấp với chống ồn chủ động và âm thanh Spatial Audio",
        mau_sac: "Bạc,Xanh,Hồng,Xám,Xanh lá",
        mau_kho: "Bạc",
        
        anh_san_pham_json: JSON.stringify(headphoneImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/252828/airpods-max-{color}-{index}.jpg",
        
        gia_goc: "13500000",
        gia_hien_tai: "12500000",
        so_luong: "30",
        bao_hanh: "12 tháng chính hãng Apple",
        ngay_phat_hanh: "12/2020",
        
        khuyen_mai: commonPromotions.slice(0, 4).join(" | "),
        danh_gia_json: JSON.stringify(headphoneReviews),
        thong_so_ky_thuat: JSON.stringify(headphoneConfig)
      }
    ];
  }

  if (productType === "backup_charger") {
    const chargerImages = {
      "Đen": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311891/anker-powercore-10000-pd-redux-black-1-638579826887738046-550x340.jpg",
          title: "Anker PowerCore 10000 PD Redux Đen"
        }
      ],
      "Trắng": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311891/anker-powercore-10000-pd-redux-white-1-638579826893856912-550x340.jpg",
          title: "Anker PowerCore 10000 PD Redux Trắng"
        }
      ]
    };

    const chargerReviews: ProductReviewData[] = [
      {
        title: "Sạc nhanh và nhỏ gọn",
        content: "Pin dự phòng nhỏ gọn nhưng sạc rất nhanh. Phù hợp mang theo hàng ngày.",
        rating: 4,
        author: "MobileUser"
      }
    ];

    const chargerConfig = {
      batteryCapacity: "10000mAh",
      batteryCellType: "Li-Polymer",
      chargingEfficiency: "85%",
      output: ["USB-A: 5V⎓2.4A", "USB-C: 5V⎓3A"],
      input: ["USB-C: 5V⎓2A"],
      chargingTime: ["5-6 giờ (2A)", "3-4 giờ (3A)"],
      technologyFeatures: ["PowerIQ 3.0", "Trickle-Charging Mode", "MultiProtect Safety"]
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "ANKERPC001",
        ten_nhom: "Anker PowerCore 10000",
        thuong_hieu: "Anker",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311891/anker-powercore-group.jpg",
        
        ten_san_pham: "PowerCore 10000 PD Redux",
        bien_the: "10000mAh",
        mo_ta: "Pin dự phòng 10000mAh với sạc nhanh USB-C PD, nhỏ gọn và tiện lợi",
        mau_sac: "Đen,Trắng",
        mau_kho: "Đen",
        
        anh_san_pham_json: JSON.stringify(chargerImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311891/anker-powercore-10000-pd-redux-{color}-{index}.jpg",
        
        gia_goc: "1200000",
        gia_hien_tai: "1100000",
        so_luong: "80",
        bao_hanh: "18 tháng chính hãng Anker",
        ngay_phat_hanh: "01/2024",
        
        khuyen_mai: commonPromotions.slice(0, 3).join(" | "),
        danh_gia_json: JSON.stringify(chargerReviews),
        thong_so_ky_thuat: JSON.stringify(chargerConfig)
      }
    ];
  }

  if (productType === "cable_charger_hub") {
    const hubImages = {
      "Xám": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311743/anker-powerexpand-7in1-usb-c-hub-gray-1-638574947291362046-550x340.jpg",
          title: "Anker PowerExpand+ 7-in-1 USB-C Hub"
        }
      ]
    };

    const hubReviews: ProductReviewData[] = [
      {
        title: "Hub đa năng tuyệt vời",
        content: "Đầy đủ cổng kết nối, chất lượng build tốt. Hoàn hảo cho laptop MacBook.",
        rating: 5,
        author: "TechPro"
      }
    ];

    const hubConfig = {
      ports: ["USB-C PD", "2x USB-A 3.0", "HDMI 4K", "SD/microSD", "Ethernet"],
      maxPowerDelivery: "85W",
      hdmiResolution: "4K@30Hz",
      dataTransferSpeed: "USB 3.0 (5Gbps)",
      compatibility: ["MacBook", "Windows laptops", "iPad Pro"],
      features: ["Plug and Play", "Compact Design", "Aluminum Build"]
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "ANKERHUB001",
        ten_nhom: "Anker USB-C Hub",
        thuong_hieu: "Anker",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311743/anker-hub-group.jpg",
        
        ten_san_pham: "PowerExpand+ 7-in-1 USB-C Hub",
        bien_the: "7-in-1",
        mo_ta: "Hub USB-C đa năng 7 trong 1 với HDMI 4K, USB 3.0 và sạc nhanh 85W",
        mau_sac: "Xám",
        mau_kho: "Xám",
        
        anh_san_pham_json: JSON.stringify(hubImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/57/311743/anker-powerexpand-7in1-usb-c-hub-{color}-{index}.jpg",
        
        gia_goc: "2200000",
        gia_hien_tai: "2000000",
        so_luong: "40",
        bao_hanh: "18 tháng chính hãng Anker",
        ngay_phat_hanh: "03/2024",
        
        khuyen_mai: commonPromotions.slice(0, 4).join(" | "),
        danh_gia_json: JSON.stringify(hubReviews),
        thong_so_ky_thuat: JSON.stringify(hubConfig)
      }
    ];
  }

  if (productType === "wired_earphone") {
    const wiredEarphoneImages = {
      "Trắng": [
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/84848/earpods-lightning-1-638344345636029164-550x340.jpg",
          title: "EarPods với Lightning Connector"
        },
        {
          url: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/84848/earpods-lightning-2-638344345641872034-550x340.jpg",
          title: "EarPods với Lightning Connector - Cable"
        }
      ]
    };

    const wiredEarphoneReviews: ProductReviewData[] = [
      {
        title: "Âm thanh rõ ràng, thiết kế tiện lợi",
        content: "EarPods có thiết kế phù hợp với tai, âm thanh cân bằng tốt cho nghe nhạc và gọi điện.",
        rating: 4,
        author: "DailyUser"
      },
      {
        title: "Giá trị tốt cho tiền",
        content: "Tai nghe có dây đáng tin cậy với chất lượng âm thanh ổn định và độ bền cao.",
        rating: 4,
        author: "ValueSeeker"
      }
    ];

    const wiredEarphoneConfig = {
      audioTechonology: ["Dynamic drivers", "Built-in microphone"],
      compatibility: ["iPhone", "iPad", "iPod"],
      audioJack: "Lightning connector",
      cableLength: "1.2m",
      features: ["Built-in remote", "Microphone", "Volume control"],
      controlType: ["Inline remote", "Microphone button"],
      controlButtons: ["Play/Pause", "Volume +/-", "Skip tracks"],
      weight: "12g",
      brandOrigin: "Apple USA",
      manufactured: "Trung Quốc"
    };

    return [
      {
        ...commonGroupData,
        ma_nhom: "EARPODS001",
        ten_nhom: "EarPods Lightning",
        thuong_hieu: "Apple",
        anh_nhom: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/84848/earpods-lightning-group.jpg",
        
        ten_san_pham: "EarPods với Lightning Connector",
        bien_the: "Lightning",
        mo_ta: "Tai nghe có dây EarPods với cổng Lightning, thiết kế thoải mái và âm thanh chất lượng",
        mau_sac: "Trắng",
        mau_kho: "Trắng",
        
        anh_san_pham_json: JSON.stringify(wiredEarphoneImages),
        anh_pattern: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/54/84848/earpods-lightning-{color}-{index}.jpg",
        
        gia_goc: "750000",
        gia_hien_tai: "690000",
        so_luong: "150",
        bao_hanh: "12 tháng chính hãng Apple",
        ngay_phat_hanh: "09/2016",
        
        khuyen_mai: commonPromotions.slice(0, 3).join(" | "),
        danh_gia_json: JSON.stringify(wiredEarphoneReviews),
        thong_so_ky_thuat: JSON.stringify(wiredEarphoneConfig)
      }
    ];
  }

  // Default template for unknown product types
  return [{
    ma_nhom: 'SAMPLE001',
    ten_nhom: 'Sample Product Group',
    thuong_hieu: 'Sample Brand',
    loai_san_pham: productType,
    anh_nhom: 'https://example.com/sample-group.jpg',
    ten_san_pham: 'Sample Product',
    bien_the: 'Standard',
    mo_ta: 'Sample product description',
    mau_sac: 'Đen,Trắng',
    mau_kho: 'Đen',
    gia_goc: '1000000',
    gia_hien_tai: '900000',
    so_luong: '100',
    anh_san_pham_json: JSON.stringify({
      'Đen': [{ url: 'https://example.com/sample-black.jpg', title: 'Sample Black' }],
      'Trắng': [{ url: 'https://example.com/sample-white.jpg', title: 'Sample White' }]
    }),
    anh_pattern: 'https://example.com/{product}-{color}-{index}.jpg',
    khuyen_mai: commonPromotions.slice(0, 3).join(" | "),
    danh_gia_json: JSON.stringify([
      { title: 'Great Product', content: 'Very satisfied with quality and performance', rating: 5, author: 'Customer' }
    ]),
    thong_so_ky_thuat: JSON.stringify({
      feature1: 'Sample feature 1',
      feature2: 'Sample feature 2',
      specification: 'Sample specification'
    }),
    bao_hanh: '12 tháng',
    ngay_phat_hanh: '2024'
  }];
};

// Maintain backward compatibility
export const generateExcelTemplate = (productType: string) => {
  // Convert enhanced template to simple format for backward compatibility
  const enhancedData = generateEnhancedExcelTemplate(productType);
  
  return enhancedData.map(item => ({
    groupName: item.ten_nhom,
    brand: item.thuong_hieu,
    type: item.loai_san_pham,
    image: item.anh_nhom,
    productName: item.ten_san_pham,
    variant: item.bien_the,
    description: item.mo_ta,
    colors: item.mau_sac,
    inventoryColor: item.mau_kho,
    quantity: parseInt(item.so_luong),
    originalPrice: parseInt(item.gia_goc),
    currentPrice: parseInt(item.gia_hien_tai),
    config: item.thong_so_ky_thuat
  }));
};

export const getProductTypeVietnamese = (type: string): string => {
  switch (type) {
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

// Field mappings for validation
export const requiredFields = [
  "ma_nhom", "ten_nhom", "thuong_hieu", "loai_san_pham",
  "bien_the", "mau_sac", "gia_hien_tai", "so_luong"
];

export const optionalFields = [
  "anh_nhom", "mo_ta", "anh_san_pham", "gia_goc",
  "bao_hanh", "ngay_phat_hanh", "khuyen_mai", "danh_gia"
]; 