import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/productCard.css';

interface Product {
  productId: string;
  variant: string;
  orderNumber: number;
  productName: string;
  defaultOriginalPrice: string | null;
  defaultCurrentPrice: string | null;
  defaultColor?: string | null;
}

interface GroupDto {
  groupId: number;
  orderNumber: number;
  image: string | null;
  type: string;
  groupName?: string;
  brand?: string;
}

interface GroupProduct {
  products: Product[];
  groupDto: GroupDto;
  elasticsearchScore?: number;
}

interface ProductCardProps {
  groupproduct: GroupProduct;
}

// Utility functions for price handling
const parsePrice = (price: string | number | null): number | null => {
  if (price === null) return null;
  if (typeof price === 'number') return price;
  return Number(price.toString().replace(/\./g, '').replace('₫', ''));
};

const formatPrice = (price: string | number | null): string => {
  if (price === null) return 'Liên hệ';
  const num = typeof price === 'string' ? parsePrice(price) : price;
  if (num === null) return 'Liên hệ';
  return num.toLocaleString('vi-VN') + '₫';
};

const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

const ProductCard: React.FC<ProductCardProps> = ({ groupproduct }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(groupproduct.products[0]);
  
  const href = `/detail/${groupproduct.groupDto.type.toLowerCase()}/${selectedProduct.productId}`;
  
  const originalPrice = selectedProduct.defaultOriginalPrice ? parsePrice(selectedProduct.defaultOriginalPrice) : null;
  const currentPrice = selectedProduct.defaultCurrentPrice ? parsePrice(selectedProduct.defaultCurrentPrice) : null;
  const discountPercentage = originalPrice && currentPrice && originalPrice > currentPrice 
    ? calculateDiscount(originalPrice, currentPrice) 
    : null;

  const hasMultipleVariants = groupproduct.products.length > 1;
  const isNew = false; // You can add logic to determine if product is new

  return (
    <div className="product-card">
      <Link to={href} className="product-link">
        {/* Badges */}
        {isNew && <span className="badge new">Mới</span>}
        {discountPercentage && discountPercentage > 0 && (
          <span className="badge discount">-{discountPercentage}%</span>
        )}
        
        {/* Product Image */}
        <div className="product-image">
          <img
            src={groupproduct.groupDto.image || '/images/categories/phone.png'}
            alt={selectedProduct.productName}
            loading="lazy"
          />
        </div>
        
        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">
            {groupproduct.groupDto.groupName || selectedProduct.productName}
            {selectedProduct.variant && (
              <span className="variant-info"> - {selectedProduct.variant}</span>
            )}
          </h3>
          
          {/* Price Section */}
          <div className="product-price">
            {originalPrice && discountPercentage && discountPercentage > 0 ? (
              <span className="original-price">
                {formatPrice(selectedProduct.defaultOriginalPrice)}
              </span>
            ) : (
              <span className="original-price-placeholder">-</span>
            )}
            
            <span className="current-price">
              {formatPrice(selectedProduct.defaultCurrentPrice)}
            </span>
          </div>
        </div>
      </Link>

      {/* Variant Options */}
      {hasMultipleVariants && (
        <div className="variant-options" onClick={(e) => e.preventDefault()}>
          <div className="variant-buttons">
            {groupproduct.products.map((product) => (
              <button
                key={product.productId}
                className={`variant-button ${
                  selectedProduct.productId === product.productId ? 'active' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
                title={product.defaultColor ? `Màu: ${product.defaultColor}` : undefined}
              >
                {product.variant}
              </button>
            ))}
          </div>
        
        </div>
      )}
    </div>
  );
};

export default ProductCard;