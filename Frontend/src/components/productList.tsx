import React from "react";
import { useState, useEffect} from "react";


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

interface ProductItemProps {
    groupproduct: GroupProduct;
  }

const ProductList: React.FC<ProductListProps> = ({ grouplist }) => {
    return (
      <div className="w-full">
        {grouplist.map((groupproduct, index) => (
          <ProductItem key={index} groupproduct={groupproduct} />
        ))}
      </div>
    );
  };

  export default ProductList;


  const ProductItem: React.FC<ProductItemProps> = ({ groupproduct }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product>(groupproduct.products[0]);
    const [href, setHref] = useState(
      `/${groupproduct.groupDto.type.toLowerCase()}/${selectedProduct.productId}`
    );
  
    useEffect(() => {
      setHref(`/${groupproduct.groupDto.type.toLowerCase()}/${selectedProduct.productId}`);
    }, [selectedProduct]);
  
    const parsePrice = (price: string | number | null): number | null => {
      if (price === null) return null;
      if (typeof price === 'number') return price;
      return Number(price.replace(/\./g, '').replace('₫', ''));
    };
  
    const formatPrice = (price: string | number | null): string => {
      if (price === null) return '';
      const num = typeof price === 'string' ? parsePrice(price) : price;
      if (num === null) return '';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
    };
  
    let originalPrice: number | null = null;
    let currentPrice: number | null = null;
    let discountPercentage: number | null = null;
    if (selectedProduct.defaultCurrentPrice) {
      currentPrice = parsePrice(selectedProduct.defaultCurrentPrice);
      if (selectedProduct.defaultOriginalPrice) {
        originalPrice = parsePrice(selectedProduct.defaultOriginalPrice);
        if (originalPrice && currentPrice && originalPrice > currentPrice) {
          discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }
      }
    }
  
    return (
      <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden mb-2">
        <a href={href} onClick={(e) => e.stopPropagation()}>
          <div className="flex">
            <div className="w-1/3 p-2">
              <img
                src={groupproduct.groupDto.image || '/images/categories/phone.png'}
                alt={selectedProduct.productName}
                className="w-full h-24 object-contain"
              />
            </div>
            <div className="w-2/3 p-3 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-medium text-black line-clamp-2">
                  {selectedProduct.productName}
                </h2>
                {groupproduct.products.length > 1 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {groupproduct.products.map((product) => (
                      <button
                        key={product.productId}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.productId === selectedProduct.productId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedProduct(product);
                        }}
                      >
                        {product.variant}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-1">
                <div className="text-red-500 font-bold text-sm">
                  {formatPrice(selectedProduct.defaultCurrentPrice)}
                </div>
                {originalPrice && discountPercentage && (
                  <div className="flex items-center mt-0.5">
                    <span className="text-gray-500 text-xs line-through">
                      {formatPrice(selectedProduct.defaultOriginalPrice)}
                    </span>
                    <span className="text-red-500 text-xs ml-1">-{discountPercentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  };

