import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BannerSection from './layout/bannerSection';
import ProductReview from './productReview';
import ProductSpecifications from './productSpecifications';
import ENV from '../config/env';
import { useAuth } from './hooks/useAuth';
import { addItemToCart } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import { showNotification } from './common/Notification';
import { CartItem } from '../types/cart';

// Định nghĩa interface cho props của sản phẩm
interface Image {
  url: string;
  title: string;
}

interface ProductReview {
  title: string;
  content: string;
}

interface Specification {
  name: string;
  value: string | string[];
}

interface Product {
  productId: string;
  productName: string;
  description?: string;
  isNew?: boolean;
  brand: string;
  images: Record<string, Image[]> | null;
  type: string;
  warrantyPeriod?: null;
  productReviews: ProductReview[];
  promotions: string[];
  release: string;
  original_prices: number[];
  current_prices: number[];
  specifications: Specification[];
  colors: string[] | null;
  quantities: number[];
}

interface Variant {
  productId: string;
  variant: string;
}

// Component chính: ProductDetail
const ProductDetail: React.FC<{ product: Product }> = ({ product: initialProduct }) => {
  const navigate = useNavigate();
  const { productId: urlProductId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedColor, setSelectedColor] = useState<string>('default');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Hàm fetch product data với retry logic
  const fetchProduct = useCallback(async (productId: string, isRetry = false) => {
    setIsProductLoading(true);
    setProductError(null);

    const apiUrl = `${ENV.API_URL}/products/get/${product.type}/${productId}`;
    console.log('Fetching product from:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Product = await response.json();
      console.log('Fetched product:', data);
      setProduct(data);
      setRetryCount(0);
      if (data.colors && data.colors.length > 0 && data.colors[0] != null) {
        setSelectedColor(data.colors[0]);
      } else {
        setSelectedColor('default');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      if (retryCount < maxRetries && isRetry) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchProduct(productId, true);
        }, 1000);
      } else {
        setProductError(
          `Không thể tải dữ liệu sản phẩm sau ${maxRetries} lần thử. Vui lòng thử lại.`
        );
      }
    } finally {
      setIsProductLoading(false);
    }
  }, [retryCount, product.type]);

  // Đồng bộ product với URL productId
  useEffect(() => {
    if (urlProductId && urlProductId !== product.productId) {
      fetchProduct(urlProductId, true);
    } else {
      setProduct(initialProduct);
      if (initialProduct.colors && initialProduct.colors.length > 0 && initialProduct.colors[0] != null) {
        setSelectedColor(initialProduct.colors[0]);
      } else {
        setSelectedColor('default');
      }
    }
  }, [urlProductId, initialProduct, fetchProduct]);

  // Fetch variants khi productId thay đổi
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.productId) {
        console.error('Product ID is missing');
        setError('Không thể tải thông tin sản phẩm.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${ENV.API_URL}/inventory/related/${product.productId}`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Variant[] = await response.json();
        console.log('Fetched variants:', data);
        setVariants(data);
        const currentVariantIndex = data.findIndex(
          (v) => v.productId === product.productId
        );
        setSelectedVariantIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
      } catch (error: any) {
        console.error('Error fetching variants:', error);
        setError('Không thể tải các phiên bản sản phẩm. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [product.productId]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleVariantChange = (variantIndex: number) => {
    if (variantIndex < 0 || variantIndex >= variants.length) {
      console.error('Invalid variant index:', variantIndex);
      return;
    }

    const newProductId = variants[variantIndex].productId;
    if (newProductId === product.productId) {
      console.log('Same productId, updating selectedVariantIndex only');
      setSelectedVariantIndex(variantIndex);
      return;
    }

    setSelectedVariantIndex(variantIndex);
    if (newProductId) {
      const type = product.type ? product.type.toLowerCase() : 'product';
      console.log('Navigating to:', `/${type}/${newProductId}`);
      navigate(`/${type}/${newProductId}`, { replace: true });
      fetchProduct(newProductId, true);
    }
  };

  const retryFetchVariants = () => {
    setError(null);
    setIsLoading(true);
    const fetchVariants = async () => {
      try {
        const response = await fetch(
          `${ENV.API_URL}/inventory/related/${product.productId}`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: Variant[] = await response.json();
        console.log('Fetched variants:', data);
        setVariants(data);
        const currentVariantIndex = data.findIndex(
          (v) => v.productId === product.productId
        );
        setSelectedVariantIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
      } catch (error: any) {
        console.error('Error fetching variants:', error);
        setError('Không thể tải các phiên bản sản phẩm. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  };

  const retryFetchProduct = () => {
    setProductError(null);
    setRetryCount(0);
    fetchProduct(product.productId, true);
  };

  const colorIndex = product.colors && product.colors.length > 0
    ? product.colors.indexOf(selectedColor)
    : -1;

  const currentPrice = colorIndex >= 0 && product.current_prices[colorIndex]
    ? product.current_prices[colorIndex]
    : product.current_prices[0] || 0;

  const originalPrice = colorIndex >= 0 && product.original_prices[colorIndex]
    ? product.original_prices[colorIndex]
    : product.original_prices[0] || 0;

  const imageSrc = product.images
    ? product.images[selectedColor] || product.images['default'] || []
    : [];

  return (
    <>
      <div className="bg-[#333] text-white p-8 ml-24 mr-24">
        {isProductLoading ? (
          <div className="w-full h-screen flex items-center justify-center">
            <p className="text-gray-300">Đang tải sản phẩm...</p>
          </div>
        ) : productError ? (
          <div className="w-full h-screen flex flex-col items-center justify-center text-red-500">
            <p>{productError}</p>
            <button
              onClick={retryFetchProduct}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <ProductImageGallery thumbnails={imageSrc} />
            <div className="md:ml-8 w-full md:w-1/2">
              <ProductHeader title={product.productName} isNew={product.isNew} />
              <ProductPrice
                currentPrice={currentPrice}
                originalPrice={originalPrice}
              />
              {isLoading ? (
                <p className="text-gray-300">Đang tải phiên bản...</p>
              ) : error ? (
                <div className="text-red-500">
                  <p>{error}</p>
                  <button
                    onClick={retryFetchVariants}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <ProductOptions
                  variants={variants}
                  selectedVariantIndex={selectedVariantIndex}
                  onVariantChange={handleVariantChange}
                  colorOptions={product.colors}
                  selectedColor={selectedColor}
                  onColorChange={handleColorChange}
                />
              )}
              <BannerSection imageSrc="/images/slider/slide1.png" altText="banner-pd-dt" />
              <Promotions promotions={product.promotions} />
              <ActionButtons
                product={{
                  productId: product.productId,
                  productName: product.productName,
                  price: currentPrice,
                  color: selectedColor,
                  type: product.type, // Pass type
                }}
              />
            </div>
          </div>
        )}
      </div>
      {!isProductLoading && !productError && (
        <div className="bg-white">
          <ProductSpecifications specifications={product.specifications} />
          <ProductReview />
        </div>
      )}
    </>
  );
};

// Component hiển thị tiêu đề sản phẩm
interface ProductHeaderProps {
  title: string;
  isNew?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ title, isNew }) => (
  <div>
    <h1 className="text-3xl font-bold text-white">
      {title}
      {isNew && (
        <span className="ml-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">Mới</span>
      )}
    </h1>
  </div>
);

// Component hiển thị giá sản phẩm
interface ProductPriceProps {
  currentPrice: number;
  originalPrice: number;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ currentPrice, originalPrice }) => (
  <div className="mt-4">
    <span className="text-4xl font-bold text-white">{currentPrice.toLocaleString('vi-VN')} ₫</span>
    {originalPrice > currentPrice && (
      <span className="ml-4 text-xl text-gray-400 line-through">
        {originalPrice.toLocaleString('vi-VN')} ₫
      </span>
    )}
  </div>
);

// Component hiển thị tùy chọn dung lượng và màu sắc
interface ProductOptionsProps {
  variants: Variant[];
  selectedVariantIndex: number;
  onVariantChange: (index: number) => void;
  colorOptions: string[] | null;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  variants,
  selectedVariantIndex,
  onVariantChange,
  colorOptions,
  selectedColor,
  onColorChange,
}) => (
  <div className="mt-6 mb-6">
    {variants.length > 1 && (
      <div>
        <h3 className="text-lg font-semibold">Phiên bản</h3>
        <div className="flex flex-wrap gap-4 mt-2">
          {variants.map((variant, index) => (
            <button
              key={variant.productId}
              className={`px-4 py-2 rounded-full ${
                selectedVariantIndex === index
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-black'
              }`}
              onClick={() => onVariantChange(index)}
              aria-selected={selectedVariantIndex === index}
            >
              {variant.variant}
            </button>
          ))}
        </div>
      </div>
    )}
    {colorOptions && colorOptions.length > 0 && (
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Màu sắc: {selectedColor}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {colorOptions
            .filter((color): color is string => color != null)
            .map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? 'border-blue-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: getColorCode(color) }}
                onClick={() => onColorChange(color)}
                title={color}
                aria-label={`Chọn màu ${color}`}
              />
            ))}
        </div>
      </div>
    )}
  </div>
);

// Helper function to convert color names to CSS color codes
function getColorCode(colorName: string | null | undefined): string {
  if (!colorName) {
    return '#808080';
  }
  const colorMap: Record<string, string> = {
    'titan tự nhiên': '#D2B48C',
    'titan đen': '#1C2526',
    'titan sa mạc': '#C19A6B',
    'titan trắng': '#F5F6F5',
    'đen': '#000000',
    'trắng': '#FFFFFF',
    'đỏ': '#FF0000',
    blue: '#0000FF',
    'xanh': '#008000',
    yellow: '#FFFF00',
    'tím': '#800080',
    'cam': '#FFA500',
    'hồng': '#FFC0CB',
    'xám': '#808080',
    'bạc': '#C0C0C0',
    'vàng': '#FFD700',
  };

  return colorMap[colorName.toLowerCase()] || '#808080';
}

// Component hiển thị bộ sưu tập hình ảnh
interface ProductImageGalleryProps {
  thumbnails: Image[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ thumbnails }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [thumbnails]);

  const handlePrev = () => {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : thumbnails.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => (prevIndex < thumbnails.length - 1 ? prevIndex + 1 : 0));
  };

  if (!thumbnails || thumbnails.length === 0) {
    return (
      <div className="w-full md:w-1/2 sticky top-0 h-screen flex items-center justify-center">
        <img
          src="/images/categories/phone.png"
          alt="Default product image"
          className="w-full h-[570px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/2 sticky top-0 h-screen">
      <div className="relative overflow-hidden">
        <button
          className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center z-50 left-3"
          onClick={handlePrev}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <img
          src={thumbnails[selectedIndex].url}
          alt={thumbnails[selectedIndex].title}
          className="w-full h-[570px] transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn object-contain"
        />
        <button
          className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center z-50 right-3"
          onClick={handleNext}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="flex space-x-2 mt-4 justify-center overflow-x-auto">
        {thumbnails.map((thumb, index) => (
          <img
            key={index}
            src={thumb.url}
            alt={thumb.title}
            className={`w-16 h-16 object-cover rounded cursor-pointer transition-transform transform hover:scale-110 ${
              selectedIndex === index ? 'border-2 border-blue-500 scale-125 transition duration-300' : ''
            }`}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

// Component promotions
interface PromotionsProps {
  promotions: string[];
}

const Promotions: React.FC<PromotionsProps> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) return null;

  const [title, ...items] = promotions;
  return (
    <div className="bg-[#242426] text-white p-4 rounded-lg mt-10 mb-5">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="list-disc list-inside space-y-1">
        {items.map((promo, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: promo }} />
        ))}
      </ul>
    </div>
  );
};

// Component action buttons
interface ActionButtonsProps {
  product: {
    productId: string;
    productName: string;
    price: number;
    color: string | null; 
    type: string; // Added type
  };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ product }) => {
  const { user, isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    console.log(product.color)

    const cartItem: CartItem = {
      productId: product.productId,
      quantity: 1,
      color: product.color === 'default' ? null : product.color,
      type: product.type, // Store type
    };

    try {
      if (isAuthenticated && user?.id) {
        await addItemToCart(user.id, cartItem);
        showNotification('Đã thêm vào giỏ hàng!', 'success');
      } else {
        useCartStore.getState().addItem(cartItem);
        showNotification('Đã thêm vào giỏ hàng (khách)!', 'success');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showNotification(error.message || 'Lỗi khi thêm vào giỏ hàng', 'error');
    }
  };

  return (
    <div className="flex space-x-4 mt-4">
      <button
        onClick={handleAddToCart}
        className="flex items-center border-2 border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50"
      >
        <span className="mr-2">🛒</span> Thêm Vào Giỏ Hàng
      </button>
      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
        Mua Ngay
      </button>
    </div>
  );
};

export default ProductDetail;