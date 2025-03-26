// src/components/product/ProductGroupForm.tsx
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

  const [groupData, setGroupData] = useState({
    prefixName: "",
    groupImage: "",
    type: "PHONE" as "PHONE" | "LAPTOP" | "ACCESSORY",
  });

  const [productForms, setProductForms] = useState([
    {
      variant: "",
      description: "",
      brand: "",
      images: {} as Record<string, ImageData[]>,
      colors: [""],
      config: {} as PhoneConfig | LaptopConfig,
      promotions: [] as string[],
      productReviews: [] as ProductReview[],
      inventories: [
        { color: null, quantity: 30, originalPrice: null, currentPrice: null },
      ] as InventoryRequest[],
    },
  ]);

  const [productsToCreate, setProductsToCreate] = useState<ProductCreateRequest[]>([]);

  const handleGroupChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleAddProductForm = () => {
    const baseForm = productForms[0]; // Sao chép từ form đầu tiên
    setProductForms([
      ...productForms,
      {
        ...baseForm,
        variant: "", // Reset variant để nhập mới
        inventories: baseForm.colors.map((color) => ({
          color: color.trim() !== "" ? color : null,
          quantity: 30,
          originalPrice: null,
          currentPrice: null,
        })),
      },
    ]);
  };

  const handleAddToList = (formIndex: number) => (data: {
    variant: string;
    description: string;
    brand: string;
    images: Record<string, ImageData[]>;
    colors: string[];
    config: PhoneConfig | LaptopConfig;
    promotions: string[];
    productReviews: ProductReview[];
    inventories: InventoryRequest[];
  }) => {
    const fullProductName = `${groupData.prefixName} ${data.variant}`.trim();
    const productRequest: ProductCreateRequest = {
      productRequest: {
        productName: fullProductName,
        description: data.description,
        brand: data.brand,
        images: data.images,
        colors: data.colors,
        variant: data.variant,
        type: groupData.type,
        config: data.config,
        promotions: data.promotions.filter((p) => p.trim() !== ""),
        productReviews: data.productReviews.filter(
          (r) => r.title.trim() !== "" || r.content.trim() !== ""
        ),
      },
      inventoryRequests: data.inventories,
    };
    setProductsToCreate([...productsToCreate, productRequest]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const createdProductIds: string[] = [];
      const allVariants: string[] = [];
      const allProductNames: string[] = [];
      const allOriginalPrices: (string | null)[] = [];
      const allCurrentPrices: (string  | null)[] = [];

      for (const product of productsToCreate) {
        const actionResult = await dispatch(createProduct(product));
        if (createProduct.fulfilled.match(actionResult)) {
          const productId = actionResult.payload.productId;
          createdProductIds.push(productId);
          allVariants.push(product.productRequest.variant);
          allProductNames.push(product.productRequest.productName);
          allOriginalPrices.push(product.inventoryRequests[0].originalPrice);
          allCurrentPrices.push(product.inventoryRequests[0].currentPrice);
        } else {
          throw new Error("Không thể tạo sản phẩm");
        }
      }

      const updatedGroupData: GroupVariantRequest = {
        productIds: createdProductIds,
        image: groupData.groupImage || null,
        type: groupData.type,
        variants: allVariants,
        productNames: allProductNames,
        defaultOriginalPrices: allOriginalPrices,
        defaultCurrentPrices: allCurrentPrices,
      };

      const groupResult = await dispatch(createGroupVariant(updatedGroupData));
      if (createGroupVariant.fulfilled.match(groupResult)) {
        const groupId = groupResult.payload.groupId;
        onSuccess(groupId);

        setGroupData({ prefixName: "", groupImage: "", type: "PHONE" });
        setProductForms([
          {
            variant: "",
            description: "",
            brand: "",
            images: {},
            colors: [""],
            config: {},
            promotions: [],
            productReviews: [],
            inventories: [{ color: null, quantity: 30, originalPrice: null, currentPrice: null }],
          },
        ]);
        setProductsToCreate([]);
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm sản phẩm:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-xl font-semibold text-gray-800 mb-4">Tạo nhóm sản phẩm mới</h4>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin nhóm */}
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
                placeholder="Ví dụ: Điện thoại iPhone 16e"
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
                <option value="PHONE">Điện thoại</option>
                <option value="LAPTOP">Laptop</option>
                <option value="ACCESSORY">Phụ kiện</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danh sách form sản phẩm */}
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

        {/* Danh sách sản phẩm đã thêm */}
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

        {/* Nút submit */}
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