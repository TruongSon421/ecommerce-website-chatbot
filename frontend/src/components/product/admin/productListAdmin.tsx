import React from "react";
import { useState } from "react";
import formatProductName from "../../utils/formatProductName";
import { Link } from "react-router-dom";
interface Product {
    productId: string;
    variant: string;
    orderNumber: number;
    productName: string;
    defaultOriginalPrice: string | null;
    defaultCurrentPrice: string | null;
    defaultColor?: string | null; // Added defaultColor field
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
  elasticsearchScore?: number; // Score from Elasticsearch for search relevance
}

interface ProductListProps {
    grouplist: GroupProduct[];
}

interface ProductItemProps {
    groupproduct: GroupProduct;
}

const ProductListAdmin: React.FC<ProductListProps> = ({ grouplist }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {grouplist.map((groupproduct, index) => (
                <ProductItem key={groupproduct.groupDto.groupId || index} groupproduct={groupproduct} />
            ))}
        </div>
    );
};

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

const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

const ProductItem: React.FC<ProductItemProps> = ({ groupproduct }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product>(groupproduct.products[0]);
    
    const href = `/admin/detail/${groupproduct.groupDto.type.toLowerCase()}/${selectedProduct.productId}`;
    
    const originalPrice = selectedProduct.defaultOriginalPrice ? parsePrice(selectedProduct.defaultOriginalPrice) : null;
    const currentPrice = selectedProduct.defaultCurrentPrice ? parsePrice(selectedProduct.defaultCurrentPrice) : null;
    const discountPercentage = originalPrice && currentPrice && originalPrice > currentPrice 
        ? calculateDiscount(originalPrice, currentPrice) 
        : null;

    return (
        <div className="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4">
            <Link to={href} onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col">
                    <div className="w-full p-4 flex items-center justify-center min-h-[200px]">
                        <img
                            src={groupproduct.groupDto.image || '/images/categories/phone.png'}
                            alt={selectedProduct.productName}
                            className="w-full h-48 object-contain"
                            loading="lazy"
                        />
                    </div>
                    <div className="w-full p-4 flex flex-col justify-between border-t min-h-[120px]">
                        <div>
                            <h2 className="text-base font-medium text-black line-clamp-2 mb-2">
                                {formatProductName(selectedProduct.productName)}
                            </h2>
                            {groupproduct.products.length > 1 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {groupproduct.products.map((product) => (
                                        <button
                                            key={product.productId}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
                        <div className="mt-3">
                            <div className="text-red-500 font-bold text-lg">
                                {formatPrice(selectedProduct.defaultCurrentPrice)}
                            </div>
                            {originalPrice && discountPercentage && (
                                <div className="flex items-center mt-1">
                                    <span className="text-gray-500 text-sm line-through">
                                        {formatPrice(selectedProduct.defaultOriginalPrice)}
                                    </span>
                                    <span className="text-red-500 text-sm ml-2">-{discountPercentage}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductListAdmin;