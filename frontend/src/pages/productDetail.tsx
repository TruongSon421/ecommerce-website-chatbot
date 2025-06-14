import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../components/product/user/productDetail';
import ENV from '../config/env';
import { Product } from '../types/product';

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
        const response = await fetch(`${ENV.API_URL}/products/get/${type}/${product_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Product = await response.json();
        setProduct(data as any);
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
        <ProductDetail product={product as any} />
      ) : (
        <div className="text-center p-4">Đang tải sản phẩm...</div>
      )}
    </div>
  );
}

export default ProductGH;