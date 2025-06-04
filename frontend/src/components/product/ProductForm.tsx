import React, { useState } from "react";
import {
  PhoneConfig,
  LaptopConfig,
  InventoryRequest,
  ProductReview,
  ImageData,
} from "../../types/product";
import PhoneConfigForm from "./productConfig/PhoneConfigForm";
import LaptopConfigForm from "./productConfig/LaptopConfigForm";
import ColorVariantInput from "./ColorVariantInput";
import { formatCurrency } from "../utils/formatCurrency";

interface ProductFormProps {
  index: number;
  prefixName: string;
  type: "phone" | "laptop";
  initialData: {
    variant: string;
    description: string;
    brand: string;
    images: Record<string, ImageData[]>;
    colors: string[];
    config: PhoneConfig | LaptopConfig;
    promotions: string[];
    productReviews: ProductReview[];
    inventories: InventoryRequest[];
    warrantyPeriod?: string;
    release?: string;
  };
  onAddToList: (data: {
    variant: string;
    description: string;
    brand: string;
    images: Record<string, ImageData[]>;
    colors: string[];
    config: PhoneConfig | LaptopConfig;
    promotions: string[];
    productReviews: ProductReview[];
    inventories: InventoryRequest[];
    warrantyPeriod?: string;
    release?: string;
  }) => void;
}

// Helper function to convert formatted price string to number
const parsePriceToNumber = (priceStr: string | null): number | null => {
  if (!priceStr || priceStr.trim() === "") return null;
  const cleanPrice = priceStr.replace(/[₫.,]/g, "");
  const numericValue = parseInt(cleanPrice, 10);
  return isNaN(numericValue) ? null : numericValue;
};

const ProductForm: React.FC<ProductFormProps> = ({
  index,
  prefixName,
  type,
  initialData,
  onAddToList,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  
  // Đảm bảo luôn có ít nhất một màu mặc định
  const initializeFormData = () => {
    const colors = initialData.colors.length > 0 ? initialData.colors : [""];
    const images = { ...initialData.images };
    
    // Đảm bảo màu mặc định có ít nhất một trường hình ảnh
    if (colors.includes("") && !images[""]) {
      images[""] = [{ url: "", title: "" }];
    }
    
    const inventories = colors.map((color, idx) => {
      const existingInventory = initialData.inventories[idx] || {
        color: null,
        quantity: 30,
        originalPrice: null,
        currentPrice: null,
      };
      return {
        ...existingInventory,
        color: color.trim() === "" ? null : color,
      };
    });

    return {
      ...initialData,
      colors,
      images,
      inventories,
      warrantyPeriod: initialData.warrantyPeriod || "",
      release: initialData.release || "",
    };
  };

  const [formData, setFormData] = useState(initializeFormData());
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStringChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof PhoneConfig | keyof LaptopConfig
  ) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (type === "phone") {
        const newConfig = { ...prev.config } as PhoneConfig;
        const arrayFields = [
          "rearVideoRecording",
          "rearCameraFeatures",
          "frontCameraFeatures",
          "batteryFeatures",
          "securityFeatures",
          "specialFeatures",
          "recording",
          "video",
          "audio",
          "wifi",
          "gps",
          "bluetooth",
          "otherConnectivity",
        ] as const;

        if (!arrayFields.includes(field as typeof arrayFields[number])) {
          newConfig[field as keyof Omit<PhoneConfig, typeof arrayFields[number]>] = value;
        }
        return { ...prev, config: newConfig };
      } else if (type === "laptop") {
        const newConfig = { ...prev.config } as LaptopConfig;
        const arrayFields = [
          "storage",
          "colorGamut",
          "displayTechnology",
          "touchScreen",
          "audioTechnology",
          "ports",
          "wirelessConnectivity",
          "otherFeatures",
        ] as const;

        if (!arrayFields.includes(field as typeof arrayFields[number])) {
          newConfig[field as keyof Omit<LaptopConfig, typeof arrayFields[number]>] = value;
        }
        return { ...prev, config: newConfig };
      } else {
        return prev;
      }
    });
  };

  const handleArrayUpdate = (
    field: keyof PhoneConfig | keyof LaptopConfig,
    arrayValue: string[]
  ) => {
    setFormData((prev) => {
      if (type === "phone") {
        const newConfig = { ...prev.config } as PhoneConfig;
        const arrayFields = [
          "rearVideoRecording",
          "rearCameraFeatures",
          "frontCameraFeatures",
          "batteryFeatures",
          "securityFeatures",
          "specialFeatures",
          "recording",
          "video",
          "audio",
          "wifi",
          "gps",
          "bluetooth",
          "otherConnectivity",
        ] as const;

        if (arrayFields.includes(field as typeof arrayFields[number])) {
          newConfig[field as keyof Pick<PhoneConfig, typeof arrayFields[number]>] = arrayValue;
        }
        return { ...prev, config: newConfig };
      } else if (type === "laptop") {
        const newConfig = { ...prev.config } as LaptopConfig;
        const arrayFields = [
          "storage",
          "colorGamut",
          "displayTechnology",
          "touchScreen",
          "audioTechnology",
          "ports",
          "wirelessConnectivity",
          "otherFeatures",
        ] as const;

        if (arrayFields.includes(field as typeof arrayFields[number])) {
          newConfig[field as keyof Pick<LaptopConfig, typeof arrayFields[number]>] = arrayValue;
        }
        return { ...prev, config: newConfig };
      } else {
        return prev;
      }
    });
  };

  const handlePromotionChange = (idx: number, value: string) => {
    const newPromotions = [...formData.promotions];
    newPromotions[idx] = value;
    setFormData({ ...formData, promotions: newPromotions });
  };

  const addPromotionField = () => {
    setFormData((prev) => ({
      ...prev,
      promotions: [...prev.promotions, ""],
    }));
  };

  const removePromotionField = (idx: number) => {
    const newPromotions = formData.promotions.filter((_, i) => i !== idx);
    setFormData({ ...formData, promotions: newPromotions });
  };

  const handleReviewChange = (
    idx: number,
    field: "title" | "content",
    value: string
  ) => {
    const newReviews = [...formData.productReviews];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setFormData({ ...formData, productReviews: newReviews });
  };

  const addReviewField = () => {
    setFormData((prev) => ({
      ...prev,
      productReviews: [...prev.productReviews, { title: "", content: "" }],
    }));
  };

  const removeReviewField = (idx: number) => {
    const newReviews = formData.productReviews.filter((_, i) => i !== idx);
    setFormData({ ...formData, productReviews: newReviews });
  };

  const handleImageChange = (
    color: string,
    idx: number,
    field: "url" | "title",
    value: string
  ) => {
    const newImages = { ...formData.images };
    if (!newImages[color]) newImages[color] = [];
    newImages[color][idx] = { ...newImages[color][idx], [field]: value };
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = (color: string) => {
    const newImages = { ...formData.images };
    if (!newImages[color]) newImages[color] = [];
    newImages[color].push({ url: "", title: "" });
    setFormData({ ...formData, images: newImages });
  };

  const removeImageField = (color: string, idx: number) => {
    const newImages = { ...formData.images };
    if (newImages[color] && newImages[color].length > 1) {
      newImages[color].splice(idx, 1);
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleColorChange = (colors: string[]) => {
    setFormData((prev) => {
      const newImages = { ...prev.images };
      
      // Xử lý images theo logic mới
      // 1. Xóa images của các màu không còn tồn tại
      Object.keys(newImages).forEach((color) => {
        if (!colors.includes(color)) {
          delete newImages[color];
        }
      });
      
      // 2. Thêm images cho màu mới hoặc màu mặc định
      colors.forEach((color) => {
        const colorKey = color.trim() === "" ? "" : color; 
        if (!newImages[colorKey]) {
          newImages[colorKey] = [{ url: "", title: "" }];
        }
      });

      // 3. Tạo inventories tương ứng
      const newInventories = colors.map((color, index) => {
        const existingInventory = prev.inventories[index] || {
          color: null,
          quantity: 30,
          originalPrice: null,
          currentPrice: null,
        };
        return {
          ...existingInventory,
          color: color.trim() === "" ? null : color, 
        };
      });

      return { 
        ...prev, 
        colors, 
        images: newImages, 
        inventories: newInventories 
      };
    });
  };

  const handleInventoryChange = (
    idx: number,
    field: keyof InventoryRequest,
    value: any
  ) => {
    const newInventories = [...formData.inventories];
    if (field === "quantity") {
      newInventories[idx][field] = parseInt(value) || 0;
    } else if (field === "originalPrice" || field === "currentPrice") {
      newInventories[idx][field] = value ? value : null;
    }
    setFormData({ ...formData, inventories: newInventories });
  };

  const handlePriceChange = (
    index: number,
    key: keyof InventoryRequest,
    value: string
  ) => {
    const formattedValue = formatCurrency(value);
    handleInventoryChange(index, key, formattedValue);
  };

  const handleAddToList = () => {
    setValidationError(null);

    if (!formData.variant.trim()) {
      setValidationError("Vui lòng nhập biến thể (variant) của sản phẩm.");
      return;
    }
    if (!formData.brand.trim()) {
      setValidationError("Vui lòng nhập thương hiệu (brand) của sản phẩm.");
      return;
    }

    // Kiểm tra màu sắc - đảm bảo luôn có ít nhất màu mặc định
    if (formData.colors.length === 0) {
      setValidationError("Lỗi hệ thống: Không có màu sắc nào.");
      return;
    }

    // Kiểm tra images cho từng màu (bao gồm cả màu mặc định)
    for (const color of formData.colors) {
      const colorKey = color.trim() === "" ? "" : color;
      const imagesForColor = formData.images[colorKey] || [];
      
      if (imagesForColor.length === 0) {
        const colorName = color.trim() === "" ? "màu mặc định" : `màu "${color}"`;
        setValidationError(`Vui lòng thêm ít nhất một hình ảnh cho ${colorName}.`);
        return;
      }
      
      for (const image of imagesForColor) {
        if (!image.url.trim() || !image.title.trim()) {
          const colorName = color.trim() === "" ? "màu mặc định" : `màu "${color}"`;
          setValidationError(`Hình ảnh cho ${colorName} phải có URL và tiêu đề hợp lệ.`);
          return;
        }
      }
    }

    if (formData.inventories.length !== formData.colors.length) {
      setValidationError("Số lượng màu sắc và thông tin kho không khớp.");
      return;
    }

    const processedInventories: InventoryRequest[] = [];
    for (const [index, inventory] of formData.inventories.entries()) {
      const expectedColor = formData.colors[index].trim() === "" ? null : formData.colors[index];
      
      if (inventory.color !== expectedColor) {
        setValidationError("Màu sắc trong thông tin kho phải khớp với danh sách màu sắc.");
        return;
      }
      
      if (inventory.quantity <= 0) {
        const colorName = inventory.color || "màu mặc định";
        setValidationError(`Số lượng cho ${colorName} phải lớn hơn 0.`);
        return;
      }
      
      if (!inventory.currentPrice || String(inventory.currentPrice).trim() === "") {
        const colorName = inventory.color || "màu mặc định";
        setValidationError(`Giá hiện tại cho ${colorName} không được để trống.`);
        return;
      }

      const originalPriceNumber = parsePriceToNumber(inventory.originalPrice);
      const currentPriceNumber = parsePriceToNumber(inventory.currentPrice);

      if (currentPriceNumber === null || currentPriceNumber <= 0) {
        const colorName = inventory.color || "màu mặc định";
        setValidationError(`Giá hiện tại cho ${colorName} phải là một số hợp lệ và lớn hơn 0.`);
        return;
      }

      // Nếu chỉ có màu mặc định, đặt color thành "default"
      const processedColor = formData.colors.length === 1 && formData.colors[0] === "" ? "default" : inventory.color;

      processedInventories.push({
        ...inventory,
        color: processedColor,
        originalPrice: originalPriceNumber,
        currentPrice: currentPriceNumber,
      });
    }

    // Xử lý images để submit
    const transformedImages: Record<string, Array<Record<string, string>>> = {};
    formData.colors.forEach((color) => {
      const colorKey = color.trim() === "" ? "" : color;
      // Nếu chỉ có màu mặc định, key thành "default"
      const finalKey = formData.colors.length === 1 && color === "" ? "default" : colorKey;
      transformedImages[finalKey] = (formData.images[colorKey] || []).map((img) => ({
        url: img.url,
        title: img.title,
      }));
    });

    const transformedReviews = formData.productReviews.map((review) => ({
      title: review.title,
      content: review.content,
    }));

    const productName = `${prefixName} ${formData.variant}`.trim();
    const { config, inventories, colors, images, productReviews, variant, ...baseData } = formData;

    const flattenedProductRequest = {
      ...baseData,
      productName,
      type,
      images: transformedImages,
      productReviews: transformedReviews,
      ...config,
    };

    const dataToSubmit = {
      productRequest: flattenedProductRequest,
      inventoryRequests: processedInventories,
    };

    // Call the onAddToList function
    onAddToList({
      ...formData,
      colors: formData.colors,
      inventories: processedInventories,
    });

    console.log("Flattened data structure:", JSON.stringify(dataToSubmit, null, 2));

    // Reset form sau khi thêm thành công
    resetForm();
  };

  // Function to reset form to initial state
  const resetForm = () => {
    const defaultFormData = {
      variant: "",
      description: "",
      brand: "",
      images: { "": [{ url: "", title: "" }] }, // Màu mặc định với 1 ảnh
      colors: [""], // Màu mặc định
      config: type === "phone" ? getDefaultPhoneConfig() : getDefaultLaptopConfig(),
      promotions: [],
      productReviews: [],
      inventories: [
        {
          color: null,
          quantity: 30,
          originalPrice: null,
          currentPrice: null,
        },
      ],
      warrantyPeriod: "",
      release: "",
    };

    setFormData(defaultFormData);
    setValidationError(null);
    setIsOpen(false); // Đóng form sau khi reset
    
    // Hiển thị thông báo thành công
    setTimeout(() => {
      alert("Đã thêm sản phẩm thành công! Form đã được reset để thêm sản phẩm mới.");
    }, 100);
  };

  // Helper functions to get default configs
  const getDefaultPhoneConfig = (): PhoneConfig => ({
    operatingSystem: "",
    chipset: "",
    cpu: "",
    gpu: "",
    ram: "",
    internalStorage: "",
    displaySize: "",
    displayTechnology: "",
    displayResolution: "",
    rearCamera: "",
    rearVideoRecording: [],
    rearCameraFeatures: [],
    frontCamera: "",
    frontCameraFeatures: [],
    batteryCapacity: "",
    batteryFeatures: [],
    securityFeatures: [],
    specialFeatures: [],
    recording: [],
    video: [],
    audio: [],
    wifi: [],
    gps: [],
    bluetooth: [],
    otherConnectivity: [],
    design: "",
    material: "",
    size: "",
    weight: "",
  });

  const getDefaultLaptopConfig = (): LaptopConfig => ({
    operatingSystem: "",
    chipset: "",
    cpu: "",
    gpu: "",
    ram: "",
    storage: [],
    displaySize: "",
    displayResolution: "",
    colorGamut: [],
    displayTechnology: [],
    touchScreen: [],
    audioTechnology: [],
    ports: [],
    wirelessConnectivity: [],
    otherFeatures: [],
    design: "",
    material: "",
    size: "",
    weight: "",
  });

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-md shadow-sm">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h6 className="text-md font-semibold text-gray-800">
          Sản phẩm {index + 1}: {prefixName}{" "}
          {formData.variant || "(Chưa nhập biến thể)"}
        </h6>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {validationError && (
            <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
              {validationError}
            </div>
          )}

          <div>
            <label
              htmlFor={`variant-${index}`}
              className="block text-gray-700 font-medium mb-1"
            >
              Biến thể
            </label>
            <input
              type="text"
              id={`variant-${index}`}
              name="variant"
              value={formData.variant}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: 128GB"
              required
            />
          </div>

          <div>
            <label
              htmlFor={`description-${index}`}
              className="block text-gray-700 font-medium mb-1"
            >
              Mô tả
            </label>
            <textarea
              id={`description-${index}`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`brand-${index}`}
                className="block text-gray-700 font-medium mb-1"
              >
                Thương hiệu
              </label>
              <input
                type="text"
                id={`brand-${index}`}
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ví dụ: iPhone (Apple)"
                required
              />
            </div>
            <div>
              <label
                htmlFor={`warrantyPeriod-${index}`}
                className="block text-gray-700 font-medium mb-1"
              >
                Thời gian bảo hành
              </label>
              <input
                type="text"
                id={`warrantyPeriod-${index}`}
                name="warrantyPeriod"
                value={formData.warrantyPeriod}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ví dụ: 12 tháng"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`release-${index}`}
              className="block text-gray-700 font-medium mb-1"
            >
              Thời điểm ra mắt
            </label>
            <input
              type="text"
              id={`release-${index}`}
              name="release"
              value={formData.release}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Tháng 9/2023"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Khuyến mãi
            </label>
            {formData.promotions.map((promotion, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={promotion}
                  onChange={(e) => handlePromotionChange(idx, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập khuyến mãi"
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removePromotionField(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800"
              onClick={addPromotionField}
            >
              + Thêm khuyến mãi
            </button>
          </div>

          <div>
            <h6 className="text-md font-medium text-gray-700 mb-2">
              Cấu hình chi tiết
            </h6>
            {type === "phone" && (
              <PhoneConfigForm
                config={formData.config as PhoneConfig}
                onChange={handleStringChange}
                onArrayUpdate={handleArrayUpdate}
              />
            )}
            {type === "laptop" && (
              <LaptopConfigForm
                config={formData.config as LaptopConfig}
                onChange={handleStringChange}
                onArrayUpdate={handleArrayUpdate}
              />
            )}
          </div>

          <div>
            <ColorVariantInput
              colors={formData.colors}
              onChange={handleColorChange}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Hình ảnh theo màu
            </label>
            {formData.colors.map((color, colorIndex) => {
              const colorKey = color.trim() === "" ? "" : color;
              const colorName = color.trim() === "" ? "Màu mặc định" : color;
              
              return (
                <div key={`${colorKey}-${colorIndex}`} className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-600 font-medium mb-2 flex items-center">
                    {color.trim() === "" ? (
                      <>
                        <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                        {colorName}
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">luôn có sẵn</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Màu: {colorName}
                      </>
                    )}
                  </p>
                  {(formData.images[colorKey] || []).map((image, idx) => (
                    <div key={idx} className="space-y-2 mb-2 ml-5">
                      <input
                        type="text"
                        value={image.url}
                        onChange={(e) =>
                          handleImageChange(colorKey, idx, "url", e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập URL hình ảnh"
                        required
                      />
                      <input
                        type="text"
                        value={image.title}
                        onChange={(e) =>
                          handleImageChange(colorKey, idx, "title", e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tiêu đề hình ảnh"
                        required
                      />
                      {/* Chỉ cho phép xóa ảnh nếu có nhiều hơn 1 ảnh */}
                      {(formData.images[colorKey]?.length || 0) > 1 && (
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700 text-sm"
                          onClick={() => removeImageField(colorKey, idx)}
                        >
                          ✕ Xóa ảnh này
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="ml-5 text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => addImageField(colorKey)}
                  >
                    + Thêm hình ảnh cho {colorName.toLowerCase()}
                  </button>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Thông tin kho
            </label>
            {formData.inventories.map((inventory, idx) => {
              const colorName = inventory.color || "Màu mặc định";
              
              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Màu sắc
                    </label>
                    <input
                      type="text"
                      value={colorName}
                      className="w-full p-2 border rounded-md bg-gray-100 text-gray-600"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      value={inventory.quantity}
                      onChange={(e) =>
                        handleInventoryChange(idx, "quantity", parseInt(e.target.value))
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Giá gốc
                    </label>
                    <input
                      type="text"
                      value={inventory.originalPrice || ""}
                      onChange={(e) =>
                        handlePriceChange(idx, "originalPrice", e.target.value)
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tùy chọn"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Giá hiện tại *
                    </label>
                    <input
                      type="text"
                      value={inventory.currentPrice || ""}
                      onChange={(e) =>
                        handlePriceChange(idx, "currentPrice", e.target.value)
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bắt buộc"
                      required
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Đánh giá sản phẩm
            </label>
            {formData.productReviews.map((review, idx) => (
              <div
                key={idx}
                className="mb-4 p-4 bg-gray-100 rounded-md"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={review.title}
                    onChange={(e) =>
                      handleReviewChange(idx, "title", e.target.value)
                    }
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề đánh giá"
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeReviewField(idx)}
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={review.content}
                  onChange={(e) =>
                    handleReviewChange(idx, "content", e.target.value)
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập nội dung đánh giá"
                />
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800"
              onClick={addReviewField}
            >
              + Thêm đánh giá
            </button>
          </div>

          <button
            type="button"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
            onClick={handleAddToList}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Thêm vào danh sách</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
            onClick={resetForm}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2M15 15v-2a8 8 0 00-15.356-2" />
            </svg>
            <span>Reset Form</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductForm;