import React from "react";
import { useState } from "react";
import formatProductName from "../../utils/formatProductName";
import { Link } from "react-router-dom";
import { addItemToCart } from '../../../services/cartService';
import { useAuth } from '../../hooks/useAuth'; // Adjust path as needed
import { useNotification } from '../../common/Notification'; // Adjust path as needed

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
}

interface ProductListProps {
    grouplist: GroupProduct[];
}

interface ProductItemProps {
    groupproduct: GroupProduct;
}

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    color: string;
    available: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ grouplist }) => {
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
    const { user, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    
    const href = `/detail/${groupproduct.groupDto.type.toLowerCase()}/${selectedProduct.productId}`;
    
    const originalPrice = selectedProduct.defaultOriginalPrice ? parsePrice(selectedProduct.defaultOriginalPrice) : null;
    const currentPrice = selectedProduct.defaultCurrentPrice ? parsePrice(selectedProduct.defaultCurrentPrice) : null;
    const discountPercentage = originalPrice && currentPrice && originalPrice > currentPrice 
        ? calculateDiscount(originalPrice, currentPrice) 
        : null;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentPrice) {
            showNotification('Sản phẩm chưa có giá', 'error');
            return;
        }

        console.log('Adding to cart:', { 
            productId: selectedProduct.productId, 
            color: selectedProduct.defaultColor, 
            productType: groupproduct.groupDto.type 
        });

        const cartItem: CartItem = {
            productId: selectedProduct.productId,
            productName: selectedProduct.productName,
            price: currentPrice,
            quantity: 1,
            color: selectedProduct.defaultColor === 'default' || !selectedProduct.defaultColor 
                ? 'Không xác định' 
                : selectedProduct.defaultColor,
            available: true,
        };

        try {
            await addItemToCart(user?.id || 'guest', cartItem, isAuthenticated);
            showNotification('Đã thêm vào giỏ hàng!', 'success');
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            showNotification(error.message || 'Lỗi khi thêm vào giỏ hàng', 'error');
        }
    };

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
                                            title={product.defaultColor ? `Màu: ${product.defaultColor}` : undefined}
                                        >
                                            {product.variant}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-3 space-y-2">
                            <div className="text-red-500 font-bold text-lg">
                                {formatPrice(selectedProduct.defaultCurrentPrice)}
                            </div>
                            {originalPrice && discountPercentage && (
                                <div className="flex items-center">
                                    <span className="text-gray-500 text-sm line-through">
                                        {formatPrice(selectedProduct.defaultOriginalPrice)}
                                    </span>
                                    <span className="text-red-500 text-sm ml-2">-{discountPercentage}%</span>
                                </div>
                            )}
                            
                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                                disabled={!currentPrice}
                            >
                                <svg 
                                    className="w-4 h-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 004 16v0a1 1 0 001 1h11M16 17a2 2 0 11-4 0 2 2 0 014 0zM10 17a2 2 0 11-4 0 2 2 0 014 0z" 
                                    />
                                </svg>
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductList;