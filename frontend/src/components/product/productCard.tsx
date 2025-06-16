import React from 'react';
import '../../styles/productCard.css';


interface imagesUrl {
  url: string;
  title?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  current_prices: string[];
  old_prices: string;
  images: imagesUrl[];
  imageSrc: string;
  discount: number;
  isNew: boolean;
}

interface ProductCardProps {
  product: Product;
  type: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, type }) => {
  const { id, name, discount, isNew } = product;

  return (
    <a href={`/detail/${type}/${id}`}>
      <div className="product-card">
        {isNew && <span className="badge new">Mới</span>}
        {discount > 0 && <span className="badge discount">-{discount}%</span>}
        
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0].url} alt={name} />
          ) : (
            <img src={product.imageSrc} alt={name} />
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{name}</h3>
          
          <div className="product-price">
            {discount > 0 ? (
              <span className="original-price">{product.old_prices}</span>
            ) : (
              <span className="original-price-placeholder">-</span>
            )}
            
            <span className="price">
              {Array.isArray(product.current_prices) && product.current_prices.length > 0
                ? product.current_prices[0]
                : "Liên hệ"}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;