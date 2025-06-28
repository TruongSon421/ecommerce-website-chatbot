// src/pages/AddProductPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGroupForm from "../../components/product/admin/ProductGroupForm";

interface ProductInfo {
  productId: string;
  productName: string;
  variant: string;
  prices: { originalPrice: string | null; currentPrice: string | null }[];
}

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [addedProducts, setAddedProducts] = useState<ProductInfo[]>([]);

  const handleGroupSuccess = (groupId: string) => {
    setAddedProducts([]); // Reset danh sách sau khi tạo nhóm thành công
    navigate("/admin/products"); // Quay lại danh sách sản phẩm hoặc tùy chỉnh
  };

  const handleProductSuccess = (
    productId: string,
    productName: string,
    variant: string,
    prices: { originalPrice: string | null; currentPrice: string | null }[]
  ) => {
    const productInfo: ProductInfo = { productId, productName, variant, prices };
    setAddedProducts([...addedProducts, productInfo]);
  };

  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = addedProducts.filter((p) => p.productId !== productId);
    setAddedProducts(updatedProducts);
  };

  const handleResetAll = () => {
    setAddedProducts([]);
  };



  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Thêm nhóm sản phẩm mới</h2>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
            onClick={() => navigate("/products")}
          >
            Quay lại danh sách
          </button>
        </div>

        {/* Layout chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form tạo nhóm */}
          <div className="lg:col-span-2">
            <ProductGroupForm onSuccess={handleGroupSuccess} />
          </div>

          {/* Danh sách sản phẩm đã thêm */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold text-gray-800">
                  Sản phẩm trong nhóm ({addedProducts.length})
                </h5>
                {addedProducts.length > 0 && (
                  <button
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                    onClick={handleResetAll}
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {addedProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Chưa có sản phẩm nào được thêm vào nhóm
                  </p>
                )}
                {addedProducts.length > 0 && (
                  <ul className="space-y-3">
                    {addedProducts.map((product) => (
                      <li
                        key={product.productId}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{product.productName}</p>
                          <p className="text-sm text-gray-600">
                            ID: {product.productId} | Biến thể: {product.variant}
                          </p>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          onClick={() => handleRemoveProduct(product.productId)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;