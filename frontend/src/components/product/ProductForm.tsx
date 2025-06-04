// src/components/product/ProductForm.tsx
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
  type: "PHONE" | "LAPTOP" | "ACCESSORY";
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
  }) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  index,
  prefixName,
  type,
  initialData,
  onAddToList,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [formData, setFormData] = useState(initialData);
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
      if (type === "PHONE") {
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
      } else if (type === "LAPTOP") {
        const newConfig = { ...prev.config } as LaptopConfig;
        const arrayFields = [
          "storage",
          "colorGamut",
          "displayTechnology",
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
      if (type === "PHONE") {
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
      } else if (type === "LAPTOP") {
        const newConfig = { ...prev.config } as LaptopConfig;
        const arrayFields = [
          "storage",
          "colorGamut",
          "displayTechnology",
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

  const handleColorChange = (colors: string[]) => {
    setFormData((prev) => {
      const newImages = { ...prev.images };
      
      // Xóa images của các colors không còn tồn tại hoặc rỗng
      Object.keys(newImages).forEach((color) => {
        if (!colors.includes(color) || color.trim() === "") {
          delete newImages[color];
        }
      });
      
      // Chỉ tạo images cho các colors hợp lệ (không rỗng)
      const validColors = colors.filter(color => color.trim() !== "");
      validColors.forEach((color) => {
        if (!newImages[color]) {
          newImages[color] = [{ url: "", title: "" }];
        }
      });
      
      // Tạo inventories dựa trên số lượng colors
      let newInventories: InventoryRequest[];
      
      if (validColors.length === 0) {
        // Không có colors hợp lệ
        newInventories = [];
      } else if (validColors.length === 1) {
        // Chỉ có 1 màu -> color = null
        const existingInventory = prev.inventories.find(inv => inv.color === null) || 
                                 prev.inventories[0] || {
          color: null,
          quantity: 30,
          originalPrice: null,
          currentPrice: null,
        };
        newInventories = [{
          ...existingInventory,
          color: null,
        }];
      } else {
        // Có nhiều màu -> color có giá trị cụ thể
        newInventories = validColors.map((color) => {
          const existingInventory = prev.inventories.find(inv => inv.color === color) || {
            color: color,
            quantity: 30,
            originalPrice: null,
            currentPrice: null,
          };
          return {
            ...existingInventory,
            color: color,
          };
        });
      }
      
      return { ...prev, colors, images: newImages, inventories: newInventories };
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

    const validColors = formData.colors.filter((color) => color.trim() !== "");
    if (validColors.length === 0) {
      setValidationError("Vui lòng nhập ít nhất một màu sắc hợp lệ.");
      return;
    }

    // Kiểm tra images cho từng color hợp lệ
    for (const color of validColors) {
      const imagesForColor = formData.images[color] || [];
      if (imagesForColor.length === 0) {
        setValidationError(`Vui lòng thêm ít nhất một hình ảnh cho màu "${color}".`);
        return;
      }
      for (const image of imagesForColor) {
        if (!image.url.trim() || !image.title.trim()) {
          setValidationError(
            `Hình ảnh cho màu "${color}" phải có URL và tiêu đề hợp lệ.`
          );
          return;
        }
      }
    }

    // Kiểm tra inventories dựa trên số lượng colors
    if (validColors.length === 1) {
      // Sản phẩm có 1 màu -> phải có 1 inventory với color = null
      if (formData.inventories.length !== 1) {
        setValidationError("Sản phẩm có 1 màu phải có đúng 1 thông tin kho.");
        return;
      }
      const inventory = formData.inventories[0];
      if (inventory.color !== null) {
        setValidationError("Sản phẩm có 1 màu thì thông tin kho không cần phân biệt màu sắc.");
        return;
      }
      if (inventory.quantity <= 0) {
        setValidationError("Số lượng phải lớn hơn 0.");
        return;
      }
      if (!inventory.currentPrice || String(inventory.currentPrice).trim() === "") {
        setValidationError("Giá hiện tại không được để trống.");
        return;
      }
    } else {
      // Sản phẩm có nhiều màu -> số lượng inventories phải khớp với validColors
      if (formData.inventories.length !== validColors.length) {
        setValidationError("Số lượng màu sắc và thông tin kho không khớp.");
        return;
      }
      
      // Kiểm tra từng inventory
      for (const [index, inventory] of formData.inventories.entries()) {
        const expectedColor = validColors[index];
        if (inventory.color !== expectedColor) {
          setValidationError(
            `Màu sắc trong thông tin kho phải khớp với danh sách màu sắc.`
          );
          return;
        }
        if (inventory.quantity <= 0) {
          setValidationError(
            `Số lượng cho màu "${inventory.color}" phải lớn hơn 0.`
          );
          return;
        }
        if (!inventory.currentPrice || String(inventory.currentPrice).trim() === "") {
          setValidationError(
            `Giá hiện tại cho màu "${inventory.color}" không được để trống.`
          );
          return;
        }
      }
    }

    onAddToList({ ...formData, colors: validColors });
  };

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
            {type === "PHONE" && (
              <PhoneConfigForm
                config={formData.config as PhoneConfig}
                onChange={handleStringChange}
                onArrayUpdate={handleArrayUpdate}
              />
            )}
            {type === "LAPTOP" && (
              <LaptopConfigForm
                config={formData.config as LaptopConfig}
                onChange={handleStringChange}
                onArrayUpdate={handleArrayUpdate}
              />
            )}
            {type === "ACCESSORY" && (
              <p className="text-gray-500">
                Chưa có cấu hình chi tiết cho phụ kiện.
              </p>
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
            {formData.colors
              .filter((color) => color.trim() !== "")
              .map((color) => (
                <div key={color} className="mb-4">
                  <p className="text-gray-600 font-medium mb-2">Màu: {color}</p>
                  {(formData.images[color] || []).map((image, idx) => (
                    <div key={idx} className="space-y-2 mb-2">
                      <input
                        type="text"
                        value={image.url}
                        onChange={(e) =>
                          handleImageChange(color, idx, "url", e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập URL hình ảnh"
                        required
                      />
                      <input
                        type="text"
                        value={image.title}
                        onChange={(e) =>
                          handleImageChange(color, idx, "title", e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tiêu đề hình ảnh"
                        required
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => addImageField(color)}
                  >
                    + Thêm hình ảnh
                  </button>
                </div>
              ))}
            {formData.colors.filter((color) => color.trim() !== "").length === 0 && (
              <p className="text-gray-500 italic">
                Vui lòng thêm màu sắc để có thể nhập hình ảnh
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Thông tin kho
            </label>
            {formData.inventories.length > 0 ? (
              <>
                {formData.colors.filter((color) => color.trim() !== "").length === 1 && (
                  <div className="mb-3 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-700 text-sm rounded-md">
                    <p>💡 Sản phẩm chỉ có 1 màu nên không cần phân biệt màu sắc trong kho</p>
                  </div>
                )}
                {formData.inventories.map((inventory, idx) => {
                  const validColors = formData.colors.filter((color) => color.trim() !== "");
                  const isMultiColor = validColors.length > 1;
                  
                  return (
                    <div
                      key={idx}
                      className={`grid gap-4 mb-4 ${
                        isMultiColor 
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
                          : "grid-cols-1 sm:grid-cols-3"
                      }`}
                    >
                      {isMultiColor && (
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">
                            Màu sắc
                          </label>
                          <input
                            type="text"
                            value={inventory.color || ""}
                            className="w-full p-2 border rounded-md bg-gray-100"
                            disabled
                          />
                        </div>
                      )}
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
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">
                          Giá hiện tại
                        </label>
                        <input
                          type="text"
                          value={inventory.currentPrice || ""}
                          onChange={(e) =>
                            handlePriceChange(idx, "currentPrice", e.target.value)
                          }
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="text-gray-500 italic">
                Vui lòng thêm màu sắc để có thể nhập thông tin kho
              </p>
            )}
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
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={handleAddToList}
          >
            Thêm vào danh sách
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductForm;