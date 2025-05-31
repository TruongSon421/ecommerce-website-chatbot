import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../components/product/user/productDetail';

interface Product {
  productId: string;
  productName: string;
  description?: string;
  isNew?: boolean;
  brand: string;
  images: Record<string, { url: string; title: string }[]> | null;
  type: string;
  warrantyPeriod?: null;
  productReviews: { title: string; content: string }[];
  promotions: string[];
  release: string;
  original_prices: number[];
  current_prices: number[];
  specifications: { name: string; value: string | string[] }[];
  colors: string[] | null;
  quantities: number[];
}

function ProductGH() {
  const { product_id, type } = useParams<{ product_id: string; type: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!product_id || !type) {
        setError('Thiếu thông tin sản phẩm hoặc loại sản phẩm');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8070/api/products/get/${type}/${product_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Product = await response.json();
        setProduct(data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.');
      }
    };

    fetchProducts();
  }, [product_id, type]);

  return (
    <div className="product-detail">
      {error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : product ? (
        <ProductDetail product={product} />
      ) : (
        <div className="text-center p-4">Đang tải sản phẩm...</div>
      )}
    </div>
  );
}

export default ProductGH;