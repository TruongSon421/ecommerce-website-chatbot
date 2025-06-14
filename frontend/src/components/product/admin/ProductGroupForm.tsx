import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useNavigate } from "react-router-dom"; // Thêm import này
import { createProduct, createGroupVariant } from "../../../store/slices/productSlices";
import {
  ProductCreateRequest,
  GroupVariantRequest,
  PhoneConfig,
  LaptopConfig,
  InventoryRequest,
  ProductReview,
} from "../../../types/product";
import ProductForm from "./ProductForm";
import axios from "../../../config/axios";
import ENV from '../../../config/env';

interface ProductGroupFormProps {
  onSuccess: (groupId: string) => void;
}

interface ImageData {
  url: string;
  title: string;
}

const ProductGroupForm: React.FC<ProductGroupFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.product);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdGroupId, setCreatedGroupId] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null); // For non-critical info messages
  const navigate = useNavigate(); // Thêm hook này

  // Initialize config with default values
  const initialPhoneConfig: PhoneConfig = {
    os: "",
    processor: "",
    cpuSpeed: "",
    gpu: "",
    ram: "",
    storage: "",
    availableStorage: "",
    contactLimit: "",
    rearCameraResolution: "",
    rearVideoRecording: [],
    rearFlash: "",
    rearCameraFeatures: [],
    frontCameraResolution: "",
    frontCameraFeatures: [],
    displayTechnology: "",
    displayResolution: "",
    screenSize: "",
    maxBrightness: "",
    screenProtection: "",
    batteryCapacity: "", // Match Java DTO typo
    batteryType: "",
    maxChargingPower: "",
    batteryFeatures: [],
    securityFeatures: [],
    specialFeatures: [],
    waterResistance: "",
    recording: [],
    video: [],
    audio: [],
    mobileNetwork: "",
    simType: "",
    wifi: [],
    gps: [],
    bluetooth: [],
    chargingPort: "",
    headphoneJack: "",
    otherConnectivity: [],
    designType: "",
    materials: "",
    sizeWeight: "",
  };

  const initialLaptopConfig: LaptopConfig = {
    processorModel: "",
    coreCount: "",
    threadCount: "",
    cpuSpeed: "",
    maxCpuSpeed: "",
    ram: "",
    ramType: "",
    ramBusSpeed: "",
    maxRam: "",
    storage: [],
    screenSize: "",
    resolution: "",
    refreshRate: "",
    colorGamut: [],
    displayTechnology: [],
    touchScreen: [],
    graphicCard: "",
    audioTechnology: [],
    ports: [],
    wirelessConnectivity: [],
    webcam: "",
    otherFeatures: [],
    keyboardBacklight: "",
    size: "",
    material: "",
    battery: "",
    os: "",
  };

  const [groupData, setGroupData] = useState({
    prefixName: "",
    groupImage: "",
    type: "phone" as "phone" | "laptop",
    brand: ""
  });

  const [productForms, setProductForms] = useState([
    {
      variant: "",
      description: "",
      brand: "",
      images: {} as Record<string, ImageData[]>,
      colors: [""],
      config: initialPhoneConfig as PhoneConfig | LaptopConfig,
      promotions: [],
      productReviews: [],
      inventories: [
        { color: null, quantity: 30, originalPrice: null, currentPrice: null },
      ],
      warrantyPeriod: "",
      release: "",
    },
  ]);

  const [productsToCreate, setProductsToCreate] = useState<ProductCreateRequest[]>([]);

  // Function to remove product from list
  const handleRemoveProduct = (variantToRemove: string) => {
    const productToRemove = productsToCreate.find(p => p.productRequest.variant === variantToRemove);
    const productName = productToRemove?.productRequest.productName || variantToRemove;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}" khỏi danh sách?`)) {
      setProductsToCreate(prev => prev.filter(product => product.productRequest.variant !== variantToRemove));
      
      // Clear success message when removing products
      if (successMessage) {
        setSuccessMessage(null);
      }
      
      // Show info message
      setInfoMessage(`Đã xóa sản phẩm "${productName}" khỏi danh sách.`);
      
      // Auto clear info message after 3 seconds
      setTimeout(() => {
        setInfoMessage(null);
      }, 3000);
    }
  };

  // Function to remove all products
  const handleRemoveAllProducts = () => {
    const productCount = productsToCreate.length;
    if (window.confirm(`Bạn có chắc chắn muốn xóa tất cả ${productCount} sản phẩm khỏi danh sách? Hành động này không thể hoàn tác.`)) {
      setProductsToCreate([]);
      if (successMessage) {
        setSuccessMessage(null);
      }
      
      // Show info message
      setInfoMessage(`Đã xóa tất cả ${productCount} sản phẩm khỏi danh sách.`);
      
      // Auto clear info message after 3 seconds
      setTimeout(() => {
        setInfoMessage(null);
      }, 3000);
    }
  };

  const handleGroupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
    // Update config based on type change
    if (name === "type") {
      setProductForms((prevForms) =>
        prevForms.map((form) => ({
          ...form,
          config: value === "laptop" ? { ...initialLaptopConfig } : { ...initialPhoneConfig },
        }))
      );
    }
  };

  const handleAddProductForm = () => {
    const baseForm = productForms[0];
    setProductForms([
      ...productForms,
      {
        ...baseForm,
        variant: "",
        images: { ...baseForm.images },
        colors: [...baseForm.colors],
        config: groupData.type === "laptop" ? { ...initialLaptopConfig } : { ...initialPhoneConfig },
        promotions: [...baseForm.promotions],
        productReviews: [],
        inventories: baseForm.inventories.map((inv) => ({ ...inv })),
        warrantyPeriod: "",
        release: "",
      },
    ]);
  };

  const handleAddToList = (
    formIndex: number
  ) => (
    data: {
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
    }
  ) => {
    console.log("Adding product:", {
      prefixName: groupData.prefixName,
      variant: data.variant,
      config: data.config,
    });

    // Clear success message when adding new products
    if (successMessage) {
      setSuccessMessage(null);
    }

    const fullProductName = `${groupData.prefixName} ${data.variant}`.trim();
    const productRequest: ProductCreateRequest = {
      productRequest: {
        productName: fullProductName,
        description: data.description,
        brand: groupData.brand, // Sử dụng brand từ group
        images: { ...data.images },
        colors: [...data.colors],
        variant: data.variant,
        type: groupData.type, // PHONE, LAPTOP
        // Spread config fields directly into productRequest
        ...(groupData.type === "phone" && {
          os: (data.config as PhoneConfig).os,
          processor: (data.config as PhoneConfig).processor,
          cpuSpeed: (data.config as PhoneConfig).cpuSpeed,
          gpu: (data.config as PhoneConfig).gpu,
          ram: (data.config as PhoneConfig).ram,
          storage: (data.config as PhoneConfig).storage,
          availableStorage: (data.config as PhoneConfig).availableStorage,
          contactLimit: (data.config as PhoneConfig).contactLimit,
          rearCameraResolution: (data.config as PhoneConfig).rearCameraResolution,
          rearVideoRecording: (data.config as PhoneConfig).rearVideoRecording,
          rearFlash: (data.config as PhoneConfig).rearFlash,
          rearCameraFeatures: (data.config as PhoneConfig).rearCameraFeatures,
          frontCameraResolution: (data.config as PhoneConfig).frontCameraResolution,
          frontCameraFeatures: (data.config as PhoneConfig).frontCameraFeatures,
          displayTechnology: (data.config as PhoneConfig).displayTechnology,
          displayResolution: (data.config as PhoneConfig).displayResolution,
          screenSize: (data.config as PhoneConfig).screenSize,
          maxBrightness: (data.config as PhoneConfig).maxBrightness,
          screenProtection: (data.config as PhoneConfig).screenProtection,
          batteryCapacity: (data.config as PhoneConfig).batteryCapacity,
          batteryType: (data.config as PhoneConfig).batteryType,
          maxChargingPower: (data.config as PhoneConfig).maxChargingPower,
          batteryFeatures: (data.config as PhoneConfig).batteryFeatures,
          securityFeatures: (data.config as PhoneConfig).securityFeatures,
          specialFeatures: (data.config as PhoneConfig).specialFeatures,
          waterResistance: (data.config as PhoneConfig).waterResistance,
          recording: (data.config as PhoneConfig).recording,
          video: (data.config as PhoneConfig).video,
          audio: (data.config as PhoneConfig).audio,
          mobileNetwork: (data.config as PhoneConfig).mobileNetwork,
          simType: (data.config as PhoneConfig).simType,
          wifi: (data.config as PhoneConfig).wifi,
          gps: (data.config as PhoneConfig).gps,
          bluetooth: (data.config as PhoneConfig).bluetooth,
          chargingPort: (data.config as PhoneConfig).chargingPort,
          headphoneJack: (data.config as PhoneConfig).headphoneJack,
          otherConnectivity: (data.config as PhoneConfig).otherConnectivity,
          designType: (data.config as PhoneConfig).designType,
          materials: (data.config as PhoneConfig).materials,
          sizeWeight: (data.config as PhoneConfig).sizeWeight,
        }),
        ...(groupData.type === "laptop" && {
          processorModel: (data.config as LaptopConfig).processorModel,
          coreCount: (data.config as LaptopConfig).coreCount,
          threadCount: (data.config as LaptopConfig).threadCount,
          cpuSpeed: (data.config as LaptopConfig).cpuSpeed,
          maxCpuSpeed: (data.config as LaptopConfig).maxCpuSpeed,
          ram: (data.config as LaptopConfig).ram,
          ramType: (data.config as LaptopConfig).ramType,
          ramBusSpeed: (data.config as LaptopConfig).ramBusSpeed,
          maxRam: (data.config as LaptopConfig).maxRam,
          storage: (data.config as LaptopConfig).storage,
          screenSize: (data.config as LaptopConfig).screenSize,
          resolution: (data.config as LaptopConfig).resolution,
          refreshRate: (data.config as LaptopConfig).refreshRate,
          colorGamut: (data.config as LaptopConfig).colorGamut,
          displayTechnology: (data.config as LaptopConfig).displayTechnology,
          touchScreen: (data.config as LaptopConfig).touchScreen,
          graphicCard: (data.config as LaptopConfig).graphicCard,
          audioTechnology: (data.config as LaptopConfig).audioTechnology,
          ports: (data.config as LaptopConfig).ports,
          wirelessConnectivity: (data.config as LaptopConfig).wirelessConnectivity,
          webcam: (data.config as LaptopConfig).webcam,
          otherFeatures: (data.config as LaptopConfig).otherFeatures,
          keyboardBacklight: (data.config as LaptopConfig).keyboardBacklight,
          size: (data.config as LaptopConfig).size,
          material: (data.config as LaptopConfig).material,
          battery: (data.config as LaptopConfig).battery,
          os: (data.config as LaptopConfig).os,
        }),
        promotions: data.promotions.filter((p) => p.trim() !== ""),
        productReviews: data.productReviews.filter(
          (r) => r.title.trim() || r.content.trim()
        ),
      },
      inventoryRequests: data.inventories.map((inv) => ({
        ...inv,
        originalPrice: inv.originalPrice ? parseInt(inv.originalPrice.toString(), 10) : null,
        currentPrice: inv.currentPrice ? parseInt(inv.currentPrice.toString(), 10) : null,
      })),
    };

    console.log("Product request:", JSON.stringify(productRequest, null, 2));

    const existingIndex = productsToCreate.findIndex(
      (p) => p.productRequest.variant === data.variant
    );

    if (existingIndex >= 0) {
      const updatedProducts = [...productsToCreate];
      updatedProducts[existingIndex] = productRequest;
      setProductsToCreate(updatedProducts);
    } else {
      setProductsToCreate([...productsToCreate, productRequest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!groupData.prefixName.trim()) {
      setFormError("Vui lòng nhập tên prefix của nhóm sản phẩm.");
      return;
    }

    if (!groupData.brand.trim()) {
      setFormError("Vui lòng nhập thương hiệu của nhóm sản phẩm.");
      return;
    }

    if (productsToCreate.length === 0) {
      setFormError("Vui lòng thêm ít nhất một sản phẩm vào nhóm.");
      return;
    }

    // Kiểm tra màu sắc với logic mới
    const invalidProducts = productsToCreate.filter(product => {
      const colors = product.productRequest.colors || [];
      const hasNonDefaultColors = colors.some(color => (color || '').trim() !== "");
      
      if (hasNonDefaultColors) {
        // Nếu có màu cụ thể, phải có ít nhất 2 màu
        return colors.length < 2;
      } else {
        // Nếu chỉ có màu mặc định, chỉ cần 1 màu
        return colors.length < 1;
      }
    });

    if (invalidProducts.length > 0) {
      const invalidProductDetails = invalidProducts.map(p => {
        const colors = p.productRequest.colors || [];
        const hasNonDefaultColors = colors.some(color => (color || '').trim() !== "");
        const colorCount = colors.length;
        
        if (hasNonDefaultColors) {
          return `"${p.productRequest.variant}" (có ${colorCount} màu, cần ít nhất 2 màu khi có màu cụ thể)`;
        } else {
          return `"${p.productRequest.variant}" (có ${colorCount} màu, cần ít nhất 1 màu)`;
        }
      });

      setFormError(
        `Có ${invalidProducts.length} sản phẩm không đủ màu sắc:\n` +
        invalidProductDetails.join('\n') + 
        '\n\nVui lòng kiểm tra lại các sản phẩm trên.'
      );
      return;
    }

    try {
      console.log("Submitting products:", JSON.stringify(productsToCreate, null, 2));

      const productPromises = productsToCreate.map((product) =>
        dispatch(createProduct(product))
      );
      const productResults = await Promise.all(productPromises);

      const createdProductIds: string[] = [];
      const allVariants: string[] = [];
      const allProductNames: string[] = [];
      const allOriginalPrices: (number | null)[] = [];
      const allCurrentPrices: (number | null)[] = [];
      const allColors: (string|null)[] = [];

      for (let i = 0; i < productResults.length; i++) {
        const actionResult = productResults[i];
        const product = productsToCreate[i];

        if (createProduct.fulfilled.match(actionResult)) {
          const productId = actionResult.payload.productId;
          createdProductIds.push(productId);
          allVariants.push(product.productRequest.variant);
          allProductNames.push(product.productRequest.productName);
          allOriginalPrices.push(
            product.inventoryRequests[0].originalPrice
              ? parseInt(product.inventoryRequests[0].originalPrice.toString(), 10)
              : null
          );
          allCurrentPrices.push(
            product.inventoryRequests[0].currentPrice
              ? parseInt(product.inventoryRequests[0].currentPrice.toString(), 10)
              : null
          );
          allColors.push(
            product.inventoryRequests[0].color
          );
        } else {
          throw new Error("Không thể tạo sản phẩm.");
        }
      }

      const updatedGroupData: GroupVariantRequest = {
        productIds: createdProductIds,
        image: groupData.groupImage || null,
        type: groupData.type, // PHONE, LAPTOP
        variants: allVariants,
        productNames: allProductNames,
        defaultOriginalPrices: allOriginalPrices,
        defaultCurrentPrices: allCurrentPrices,
        defaultColors: allColors,
        groupName: groupData.prefixName, // Sử dụng prefixName làm groupName
        brand: groupData.brand, // Sử dụng brand từ group
      };

      console.log("GroupVariant payload:", JSON.stringify(updatedGroupData, null, 2));

      const groupResult = await dispatch(createGroupVariant(updatedGroupData));
      if (createGroupVariant.fulfilled.match(groupResult)) {
        const groupId = groupResult.payload.groupId;
        setCreatedGroupId(groupId);

        const elasticsearchPayload = {
          products_data: productsToCreate.map((product) => ({
            productRequest: {
              ...product.productRequest
            },
            inventoryRequests: product.inventoryRequests,
          })),
          group_data: {
            group_id: groupId,
            group_name: groupData.prefixName,
            type: groupData.type.toLowerCase(), // phone, laptop
            image: groupData.groupImage || null,
          },
        };

        console.log("Elasticsearch payload:", JSON.stringify(elasticsearchPayload, null, 2));

        try {
          const response = await axios.post(
            `${ENV.API_URL}/chatbot/rag/add-to-elasticsearch`,
            elasticsearchPayload
          );
          console.log("Elasticsearch document added:", response.data);
        } catch (esError) {
          console.error("Failed to add document to Elasticsearch:", esError);
          setFormError("Không thể thêm tài liệu vào Elasticsearch.");
        }

        // Set success message instead of calling onSuccess immediately
        setSuccessMessage(
          `🎉 Đã tạo thành công nhóm sản phẩm "${groupData.prefixName}" với ${productsToCreate.length} sản phẩm! ` +
          `Group ID: ${groupId}. Bạn có thể tiếp tục chỉnh sửa hoặc tạo nhóm mới.`
        );

        // Call onSuccess for parent component
        onSuccess(groupId);

        navigate('/admin/product/add');
      } else {
        throw new Error("Không thể tạo nhóm sản phẩm.");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo nhóm sản phẩm:", error);
      setFormError(error.message || "Đã xảy ra lỗi khi tạo nhóm sản phẩm.");
    }
  };

  // Manual reset function
  const handleManualReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn reset toàn bộ form? Tất cả dữ liệu sẽ bị mất.")) {
      setGroupData({ 
        prefixName: "", 
        groupImage: "", 
        type: "phone", 
        brand: "" 
      });
      setProductForms([
        {
          variant: "",
          description: "",
          brand: "", // Sẽ được override bởi groupData.brand
          images: {},
          colors: [""],
          config: { ...initialPhoneConfig },
          promotions: [],
          productReviews: [],
          inventories: [
            { color: null, quantity: 30, originalPrice: null, currentPrice: null },
          ],
          warrantyPeriod: "",
          release: "",
        },
      ]);
      setProductsToCreate([]);
      setSuccessMessage(null);
      setFormError(null);
      setCreatedGroupId(null);
      setInfoMessage(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-xl font-semibold text-gray-800 mb-4">Tạo nhóm sản phẩm mới</h4>

      {/* Info Message */}
      {infoMessage && (
        <div className="mb-4 p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{infoMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-semibold text-gray-800">
              Thông tin nhóm
              {createdGroupId && (
                <span className="ml-2 text-green-600 text-sm font-normal">
                  ✓ Đã tạo (ID: {createdGroupId})
                </span>
              )}
            </h5>
            {/* Manual Reset Button */}
            <button
              type="button"
              onClick={handleManualReset}
              className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm"
            >
              🔄 Reset Toàn Bộ
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prefixName" className="block text-gray-700 font-medium mb-1">
                  Tên prefix của sản phẩm
                </label>
                <input
                  type="text"
                  id="prefixName"
                  name="prefixName"
                  value={groupData.prefixName}
                  onChange={handleGroupChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: iPhone 15"
                  required
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-gray-700 font-medium mb-1">
                  Thương hiệu chung
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={groupData.brand}
                  onChange={handleGroupChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ví dụ: Apple"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="groupImage" className="block text-gray-700 font-medium mb-1">
                Nhập URL hình ảnh nhóm
              </label>
              <input
                type="text"
                id="groupImage"
                name="groupImage"
                value={groupData.groupImage}
                onChange={handleGroupChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập URL hình ảnh nhóm"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-gray-700 font-medium mb-1">
                Loại sản phẩm
              </label>
              <select
                id="type"
                name="type"
                value={groupData.type}
                onChange={handleGroupChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={createdGroupId !== null} // Disable after creation
              >
                <option value="phone">Điện thoại</option>
                <option value="laptop">Laptop</option>
                <option value="ACCESSORY">Phụ kiện</option>
              </select>
              {createdGroupId && (
                <p className="text-xs text-gray-500 mt-1">
                  Không thể thay đổi loại sản phẩm sau khi tạo nhóm
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Thêm sản phẩm vào nhóm</h5>
          
          {/* Hiển thị thông tin brand chung */}
          {groupData.brand && (
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md">
              <p className="text-sm">
                📋 <strong>Thương hiệu chung cho tất cả sản phẩm:</strong> {groupData.brand}
              </p>
            </div>
          )}

          {productForms.map((form, index) => (
            <ProductForm
              key={index}
              index={index}
              prefixName={groupData.prefixName}
              type={groupData.type}
              brand={groupData.brand} // Truyền brand từ group
              initialData={{
                ...form,
                brand: groupData.brand // Override brand với group brand
              }}
              onAddToList={handleAddToList(index)}
            />
          ))}
          <button
            type="button"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            onClick={handleAddProductForm}
          >
            + Thêm sản phẩm mới
          </button>
        </div>

        {productsToCreate.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-lg font-semibold text-gray-800">
              Sản phẩm đã thêm ({productsToCreate.length})
            </h5>
            {(() => {
              const validProducts = productsToCreate.filter(p => {
                const colors = p.productRequest.colors || [];
                const hasNonDefaultColors = colors.some(color => (color || '').trim() !== "");
                
                if (hasNonDefaultColors) {
                  return colors.length >= 2; // Cần ít nhất 2 màu khi có màu cụ thể
                } else {
                  return colors.length >= 1; // Chỉ cần 1 màu nếu chỉ có màu mặc định
                }
              });
              const invalidProducts = productsToCreate.length - validProducts.length;
              
              return (
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {validProducts.length} hợp lệ
                  </span>
                  {invalidProducts > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                      {invalidProducts} thiếu màu
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {productsToCreate.map((product, index) => {
              const colors = product.productRequest.colors || [];
              const colorCount = colors.length;
              const hasNonDefaultColors = colors.some(color => (color || '').trim() !== "");
              
              // Kiểm tra validity với logic mới
              const isValid = hasNonDefaultColors ? colorCount >= 2 : colorCount >= 1;
              
              // Tạo message phù hợp
              const getColorMessage = () => {
                if (hasNonDefaultColors) {
                  return `${colorCount} màu ${colorCount >= 2 ? '✓' : '(cần ít nhất 2)'}`;
                } else {
                  return `${colorCount} màu mặc định ${colorCount >= 1 ? '✓' : '(cần ít nhất 1)'}`;
                }
              };
              
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                  isValid ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-red-50 border-red-200 hover:bg-red-100'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {product.productRequest.productName}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {product.productRequest.variant}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isValid 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {getColorMessage()}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {product.inventoryRequests.length} kho
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.productRequest.brand}
                      </span>
                      {/* Hiển thị chi tiết màu sắc */}
                      {colors.length > 0 && (
                        <span className="text-xs text-gray-400">
                          ({colors.map(color => color || 'mặc định').join(', ')})
                        </span>
                      )}
                    </div>
                    
                    {/* Warning message cho sản phẩm không hợp lệ */}
                    {!isValid && (
                      <div className="mt-1 text-xs text-red-600">
                        ⚠️ {hasNonDefaultColors 
                          ? 'Khi có màu cụ thể, sản phẩm cần ít nhất 2 màu sắc (bao gồm màu mặc định)'
                          : 'Sản phẩm cần ít nhất 1 màu sắc'
                        }
                      </div>
                    )}
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(product.productRequest.variant)}
                    className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors duration-200"
                    title={`Xóa sản phẩm "${product.productRequest.variant}"`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Bulk actions */}
          {productsToCreate.length > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {productsToCreate.length} sản phẩm trong danh sách
              </span>
              <button
                type="button"
                onClick={handleRemoveAllProducts}
                className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Help text về quy tắc màu sắc */}
          {productsToCreate.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md">
              <p className="text-sm">
                📋 <strong>Quy tắc màu sắc:</strong>
              </p>
              <ul className="text-xs mt-1 space-y-1 ml-4">
                <li>• Nếu chỉ có màu mặc định: chỉ cần 1 màu</li>
                <li>• Nếu có thêm màu cụ thể: cần ít nhất 2 màu (bao gồm màu mặc định)</li>
              </ul>
            </div>
          )}
        </div>
      )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {createdGroupId && (
              <div className="text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Nhóm đã được tạo thành công
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            {createdGroupId ? (
              // Update button after creation
              <button
                type="submit"
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading || productsToCreate.length === 0 || !groupData.prefixName || !groupData.brand}
              >
                {loading ? "Đang cập nhật..." : "Cập nhật nhóm sản phẩm"}
              </button>
            ) : (
              // Create button before creation
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading || productsToCreate.length === 0 || !groupData.prefixName || !groupData.brand}
              >
                {loading ? "Đang xử lý..." : "Tạo nhóm sản phẩm"}
              </button>
            )}
          </div>
        </div>

        {/* Help text */}
        {createdGroupId && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md">
            <p className="text-sm">
              💡 <strong>Mẹo:</strong> Bạn có thể tiếp tục thêm sản phẩm mới vào nhóm này, chỉnh sửa sản phẩm đã có, 
              hoặc nhấn "Reset Toàn Bộ" để tạo một nhóm sản phẩm hoàn toàn mới.
            </p>
          </div>
        )}

        {/* Additional info after creation */}
        {createdGroupId && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h6 className="font-medium text-gray-800 mb-2">Thông tin nhóm đã tạo:</h6>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Group ID:</strong> {createdGroupId}</p>
              <p><strong>Tên nhóm:</strong> {groupData.prefixName}</p>
              <p><strong>Thương hiệu:</strong> {groupData.brand}</p>
              <p><strong>Loại:</strong> {groupData.type}</p>
              <p><strong>Số sản phẩm:</strong> {productsToCreate.length}</p>
              {groupData.groupImage && (
                <p><strong>Hình ảnh:</strong> <a href={groupData.groupImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem ảnh</a></p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductGroupForm;