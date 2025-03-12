import React from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

interface Product {
    productId: string;
    variant: string;
    orderNumber: number;
    productName: string;
    defaultOriginalPrice: string | null;
    defaultCurrentPrice: string | null;
}

interface GroupDto {
    groupId: number;
    orderNumber: number;
    image: string | null;
    type: string;
}

interface GroupProduct {
    products: Product[];
    groupDto: GroupDto;
}

interface ProductListProps {
    grouplist: GroupProduct[];
}


const ProductList: React.FC<ProductListProps> = ({ grouplist }) => {
    const [visibleCount, setVisibleCount] = useState<number>(20);
    const [searchParams, setSearchParams] = useSearchParams();
    const pi = Number(searchParams.get("pi")) || 1; 
    const handleViewMore = () => {
      setVisibleCount((prev) => prev + 20);
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("pi", String(pi + 1));
      setSearchParams(currentParams);
    };
    const remaining:number = grouplist.length - visibleCount;
    const visibleProducts = grouplist.slice(0, visibleCount);
    return (
      <section className="mb-12 pl-0 pr-4">
        <div className="grid ml-52 mr-48 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {visibleProducts.map((products,index) => (
            <ProductItem key={index} groupproduct={products} />
          ))}
        </div>
        {visibleCount < grouplist.length && (
          <div className='flex justify-center '>
            <button className="text-white bg-slate-500 p-5 m-5 hover:bg-slate-300 py-2 px-4 rounded" onClick={handleViewMore}>
            Xem thêm 
            <span className='m-1'>{remaining}</span>
            sản phẩm
          </button>
          </div>
        )}
      </section>
    );
  };

  export default ProductList;


const ProductItem: React.FC<{groupproduct: GroupProduct}> = ({ groupproduct }) => {
    // State để theo dõi sản phẩm được chọn (mặc định là sản phẩm đầu tiên)
    
    const [selectedProduct, setSelectedProduct] = useState<Product>(groupproduct.products[0]);

    // Hàm hỗ trợ chuyển đổi giá từ chuỗi sang số
    const parsePrice = (price: string): number => {
        return Number(price.replace(/\./g, '').replace('₫', ''));
    };

    // Tính toán giá và phần trăm giảm giá
    let originalPrice: number | null = null;
    let currentPrice: number | null = null;
    let discountPercentage: number | null = null;
    if (selectedProduct.defaultCurrentPrice) {
        currentPrice = parsePrice(selectedProduct.defaultCurrentPrice);
    if (selectedProduct.defaultOriginalPrice) {
        originalPrice = parsePrice(selectedProduct.defaultOriginalPrice);
        if (originalPrice > currentPrice) {
            discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }
    }
    } 
    

    return (
        <div className="h-[500px] w-auto bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Bên trên : Hình ảnh sản phẩm */}
            <div className="h-1/2 p-4 flex justify-center">
                <img
                    src={groupproduct.groupDto.image || '/images/categories/phone.png'}
                    alt={selectedProduct.productName}
                    className="w-full h-full object-fit"
                />
            </div>

            {/* Bên dưới: Chi tiết sản phẩm */}
            <div className="h-1/2 p-6 flex flex-col justify-between">
                {/* Tiêu đề sản phẩm */}
                <div>
                    <h2 className="text-base text-black">
                        {selectedProduct.productName}
                    </h2>

                    {/* Thông số kỹ thuật (tạm thời bỏ qua vì không có trong interface) */}
                    {/* Trong thực tế, bạn có thể thêm các trường như RAM, màn hình, kích thước */}
                    {/* <p className="text-sm text-gray-700 mt-2">
                        {selectedProduct.variant} {/* Hiển thị biến thể đã chọn 
                    </p> */}

                    {/* Tùy chọn dung lượng lưu trữ */}
                    { groupproduct.products.length > 1 && (  
                    <div className="mt-1 flex space-x-2">
                        {groupproduct.products.map((product) => (
                            <button
                                key={product.productId}
                                className={`px-4 py-1 rounded-full text-sm font-medium ${
                                    product.productId === selectedProduct.productId
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                onClick={() => setSelectedProduct(product)}
                            >
                                {product.variant}
                            </button>
                        ))}
                    </div>
                )}
                </div>

                {/* Giá sản phẩm */}
                <div className="mt-2">
                {/* Giá hiện tại */}
                     <div className="text-red-500 font-bold text-2xl">
                            {selectedProduct.defaultCurrentPrice}
                     </div>

                {/* Giá gốc và giảm giá (nếu có) */}
                {originalPrice && discountPercentage && (
                    <div className="flex items-center mt-1">
                        <span className="text-gray-500 mr-2 text-lg line-through">
                                {selectedProduct.defaultOriginalPrice}
                    </span>
                    <span className="text-red-500 text-sm">-{discountPercentage}%</span>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

