import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createProduct, createGroupVariant } from "../../store/slices/productSlices";
import {
  ProductCreateRequest,
  GroupVariantRequest,
  PhoneConfig,
  LaptopConfig,
  InventoryRequest,
  ProductReview,
} from "../../types/product";
import ProductForm from "./ProductForm";
import axios from "../../config/axios";

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
    type: "phone" as "phone" | "laptop" | "ACCESSORY",
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

  const handleGroupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
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

    const fullProductName = `${groupData.prefixName} ${data.variant}`.trim();
    const productRequest: ProductCreateRequest = {
      productRequest: {
        productName: fullProductName,
        description: data.description,
        brand: data.brand,
        images: { ...data.images },
        colors: [...data.colors],
        variant: data.variant,
        type: groupData.type, // PHONE, LAPTOP
        warrantyPeriod: data.warrantyPeriod || "",
        release: data.release || "",
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
          batteryCapactity: (data.config as PhoneConfig).batteryCapacity,
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

    if (!groupData.prefixName.trim()) {
      setFormError("Vui lòng nhập tên prefix của nhóm sản phẩm.");
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
        groupName: groupData.prefixName,
        brand: productsToCreate[0]?.productRequest.brand || "",
      };

      console.log("GroupVariant payload:", JSON.stringify(updatedGroupData, null, 2));

      const groupResult = await dispatch(createGroupVariant(updatedGroupData));
      if (createGroupVariant.fulfilled.match(groupResult)) {
        const groupId = groupResult.payload.groupId;

        const elasticsearchPayload = {
          products_data: productsToCreate.map((product) => ({
            productRequest: {
              ...product.productRequest,
              // Map batteryCapactity to batteryCapacity for Elasticsearch
              batteryCapacity: product.productRequest.batteryCapacity,
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
            "http://localhost:5000/add-to-elasticsearch",
            elasticsearchPayload
          );
          console.log("Elasticsearch document added:", response.data);
        } catch (esError) {
          console.error("Failed to add document to Elasticsearch:", esError);
          setFormError("Không thể thêm tài liệu vào Elasticsearch.");
        }

        onSuccess(groupId);

        setGroupData({ prefixName: "", groupImage: "", type: "phone" });
        setProductForms([
          {
            variant: "",
            description: "",
            brand: "",
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
      } else {
        throw new Error("Không thể tạo nhóm sản phẩm.");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo nhóm sản phẩm:", error);
      setFormError(error.message || "Đã xảy ra lỗi khi tạo nhóm sản phẩm.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-xl font-semibold text-gray-800 mb-4">Tạo nhóm sản phẩm mới</h4>

      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Thông tin nhóm</h5>
          <div className="space-y-4">
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
                placeholder="Ví dụ: Điện thoại iPhone 16"
                required
              />
            </div>
            <div>
              <label htmlFor="groupImage" className="block text-gray-700 font-medium mb-1">
                Hình ảnh nhóm
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
              >
                <option value="phone">Điện thoại</option>
                <option value="laptop">Laptop</option>
                <option value="ACCESSORY">Phụ kiện</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md shadow-sm">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Thêm sản phẩm vào nhóm</h5>
          {productForms.map((form, index) => (
            <ProductForm
              key={index}
              index={index}
              prefixName={groupData.prefixName}
              type={groupData.type}
              initialData={form}
              onAddToList={handleAddToList(index)}
            />
          ))}
          <button
            type="button"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleAddProductForm}
          >
            + Thêm sản phẩm mới
          </button>
        </div>

        {productsToCreate.length > 0 && (
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-2">
              Sản phẩm đã thêm ({productsToCreate.length})
            </h5>
            <ul className="space-y-2">
              {productsToCreate.map((product, index) => (
                <li key={index} className="p-2 bg-gray-100 rounded-md">
                  {product.productRequest.productName} - {product.productRequest.variant}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading || productsToCreate.length === 0 || !groupData.prefixName}
          >
            {loading ? "Đang xử lý..." : "Tạo nhóm sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductGroupForm;