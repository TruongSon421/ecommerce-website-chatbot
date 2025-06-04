import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BannerSection from '../../layout/bannerSection';
import ProductReview from '../productReview';
import ProductSpecifications from '../productSpecifications';
import ENV from '../../../config/env';
import { useAuth } from '../../hooks/useAuth';
import { addItemToCart } from '../../../services/cartService';
import { useNotification } from '../../common/Notification';
import { CartItem } from '../../../types/cart';
import { GroupVariantResponse, Variant, Product, Specification, Image } from '../../../types/product';

interface ProductReview {
  title: string;
  content: string;
}

// Extend Product interface if needed
interface ExtendedProduct extends Product {
  productReviews?: ProductReview[];
}

const ProductDetail: React.FC<{ product: Product }> = ({ product: initialProduct }) => {
  const navigate = useNavigate();
  const { productId: urlProductId } = useParams<{ productId: string }>();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [groupData, setGroupData] = useState<GroupVariantResponse | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('default');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'reviews'>('overview');
  const maxRetries = 3;

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
        setSelectedColor('Không xác định');
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

  // Function để retry fetch product
  const retryFetchProduct = () => {
    if (urlProductId) {
      fetchProduct(urlProductId, true);
    }
  };

  useEffect(() => {
    if (urlProductId && urlProductId !== product.productId) {
      fetchProduct(urlProductId, true);
    } else {
      setProduct(initialProduct);
      if (initialProduct.colors && initialProduct.colors.length > 0 && initialProduct.colors[0] != null) {
        setSelectedColor(initialProduct.colors[0]);
      } else {
        setSelectedColor('Không xác định');
      }
    }
  }, [urlProductId, initialProduct, fetchProduct]);

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
        const response = await fetch(`${ENV.API_URL}/inventory/related/${product.productId}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: GroupVariantResponse = await response.json();
        console.log('Fetched group data:', data);
        setGroupData(data);
        const currentVariantIndex = data.variants.findIndex(
          (v) => v.productId === product.productId
        );
        setSelectedVariantIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
      } catch (error: any) {
        setError(error.message);
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
    if (!groupData || variantIndex < 0 || variantIndex >= groupData.variants.length) {
      console.error('Invalid variant index:', variantIndex);
      return;
    }

    const newProductId = groupData.variants[variantIndex].productId;
    if (newProductId === product.productId) {
      console.log('Same productId, updating selectedVariantIndex only');
      setSelectedVariantIndex(variantIndex);
      return;
    }

    setSelectedVariantIndex(variantIndex);
    if (newProductId) {
      const type = product.type ? product.type.toLowerCase() : 'product';
      console.log('Navigating to:', `/detail/${type}/${newProductId}`);
      navigate(`/detail/${type}/${newProductId}`, { replace: true });
      fetchProduct(newProductId, true);
    }
  };

  const retryFetchVariants = () => {
    setError(null);
    setIsLoading(true);
    const fetchVariants = async () => {
      try {
        const response = await fetch(`${ENV.API_URL}/inventory/related/${product.productId}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: GroupVariantResponse = await response.json();
        console.log('Fetched group data:', data);
        setGroupData(data);
        const currentVariantIndex = data.variants.findIndex(
          (v) => v.productId === product.productId
        );
        setSelectedVariantIndex(currentVariantIndex >= 0 ? currentVariantIndex : 0);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
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

  const quantity = colorIndex >= 0 && product.quantities[colorIndex]
    ? product.quantities[colorIndex]
    : product.quantities[0] || 0;

  const imageSrc = product.images
    ? product.images[selectedColor] || product.images['default'] || []
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Product Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isProductLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : productError ? (
            <div className="flex flex-col items-center justify-center h-96 text-red-600">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Có lỗi xảy ra</h3>
                <p className="mt-1 text-sm text-gray-500">{productError}</p>
                <div className="mt-6">
                  <button
                    onClick={retryFetchProduct}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
              {/* Image Gallery */}
              <ProductImageGallery thumbnails={imageSrc} />
              
              {/* Product Info */}
              <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                <ProductHeader title={product.productName} brand={product.brand} isNew={product.isNew} />
                <ProductPrice currentPrice={currentPrice} originalPrice={originalPrice} />
                
                {/* Stock Status */}
                <div className="mt-4">
                  <StockStatus quantity={quantity} />
                </div>

                {/* Variants and Colors */}
                {isLoading ? (
                  <div className="mt-8">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="mt-8 text-red-600 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Không thể tải phiên bản</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={retryFetchVariants}
                            className="bg-red-50 border border-red-200 rounded-md py-1.5 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Thử lại
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ProductOptions
                    variants={groupData?.variants || []}
                    selectedVariantIndex={selectedVariantIndex}
                    onVariantChange={handleVariantChange}
                    colorOptions={product.colors}
                    selectedColor={selectedColor}
                    onColorChange={handleColorChange}
                  />
                )}

                {/* Action Buttons */}
                <ActionButtons
                  product={{
                    productId: product.productId,
                    productName: product.productName,
                    price: currentPrice,
                    color: selectedColor,
                    productType: product.type,
                    quantity: quantity,
                  }}
                  showNotification={showNotification}
                />

                {/* Key Features */}
                <KeyFeatures product={product} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Promotions */}
      {!isProductLoading && !productError && (
        <Promotions promotions={product.promotions} />
      )}

      {/* Tabs Section */}
      {!isProductLoading && !productError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            product={product}
          />
        </div>
      )}
    </div>
  );
};

// Component Headers
interface ProductHeaderProps {
  title: string;
  brand: string;
  isNew?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ title, brand, isNew }) => (
  <div>
    <nav className="flex text-sm breadcrumbs">
      <ol className="inline-flex items-center space-x-1 text-gray-500">
        <li className="inline-flex items-center">
          <a href="/" className="hover:text-blue-600">Trang chủ</a>
        </li>
        <li>
          <div className="flex items-center">
            <svg className="w-3 h-3 mx-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <span className="text-gray-400">{brand}</span>
          </div>
        </li>
      </ol>
    </nav>
    
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {title}
        {isNew && (
          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Mới
          </span>
        )}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Thương hiệu: {brand}</p>
    </div>
  </div>
);

interface ProductPriceProps {
  currentPrice: number;
  originalPrice: number;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ currentPrice, originalPrice }) => {
  const discountPercent = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="mt-6">
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-gray-900">
          {currentPrice.toLocaleString('vi-VN')} ₫
        </span>
        {originalPrice > currentPrice && (
          <>
            <span className="text-lg text-gray-500 line-through">
              {originalPrice.toLocaleString('vi-VN')} ₫
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Stock Status Component
interface StockStatusProps {
  quantity: number;
}

const StockStatus: React.FC<StockStatusProps> = ({ quantity }) => {
  const getStockStatus = () => {
    if (quantity <= 0) {
      return { text: 'Hết hàng', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (quantity <= 5) {
      return { text: `Chỉ còn ${quantity} sản phẩm`, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    } else if (quantity <= 10) {
      return { text: 'Sắp hết hàng', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    } else {
      return { text: 'Còn hàng', color: 'text-green-600 bg-green-50 border-green-200' };
    }
  };

  const status = getStockStatus();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
      {status.text}
    </div>
  );
};

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
  <div className="mt-8">
    {variants.length > 1 && (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Phiên bản</h3>
        <div className="grid grid-cols-3 gap-3">
          {variants.map((variant, index) => (
            <button
              key={variant.productId}
              className={`relative border rounded-lg px-4 py-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none ${
                selectedVariantIndex === index
                  ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                  : 'border-gray-300'
              }`}
              onClick={() => onVariantChange(index)}
              aria-selected={selectedVariantIndex === index}
            >
              {variant.variant}
              {selectedVariantIndex === index && (
                <div className="absolute -inset-px rounded-lg border-2 border-blue-600 pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    )}
    {colorOptions && colorOptions.length > 0 && (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Màu sắc: {selectedColor}</h3>
        <div className="flex items-center space-x-3">
          {colorOptions
            .filter((color): color is string => color != null)
            .map((color) => (
              <button
                key={color}
                className={`relative p-0.5 rounded-full flex items-center justify-center ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                }`}
                onClick={() => onColorChange(color)}
                title={color}
                aria-label={`Select color ${color}`}
              >
                <span
                  className="h-8 w-8 rounded-full border border-black border-opacity-10"
                  style={{ backgroundColor: getColorCode(color) }}
                />
              </button>
            ))}
        </div>
      </div>
    )}
  </div>
);

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
      <div className="aspect-w-4 aspect-h-5 sm:rounded-lg sm:overflow-hidden lg:aspect-w-3 lg:aspect-h-4">
        <img
          src="/images/categories/phone.png"
          alt="Default product image"
          className="w-full h-full object-center object-cover"
        />
      </div>
    );
  }

  return (
    <div className="aspect-w-4 aspect-h-5 sm:rounded-lg sm:overflow-hidden lg:aspect-w-3 lg:aspect-h-4">
      <div className="relative">
        {thumbnails.length > 1 && (
          <button
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-lg"
            onClick={handlePrev}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <img
          src={thumbnails[selectedIndex].url}
          alt={thumbnails[selectedIndex].title}
          className="w-full h-full object-center object-cover transition-opacity duration-300"
        />
        {thumbnails.length > 1 && (
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-lg"
            onClick={handleNext}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {thumbnails.length > 1 && (
        <div className="mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
          <div className="grid grid-cols-4 gap-6">
            {thumbnails.slice(0, 4).map((thumb, index) => (
              <button
                key={index}
                className={`relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${
                  selectedIndex === index ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <span className="sr-only">{thumb.title}</span>
                <span className="absolute inset-0 rounded-md overflow-hidden">
                  <img
                    src={thumb.url}
                    alt={thumb.title}
                    className="w-full h-full object-center object-cover"
                  />
                </span>
                <span
                  className={`absolute inset-0 rounded-md ring-2 ring-offset-2 pointer-events-none ${
                    selectedIndex === index ? 'ring-blue-600' : 'ring-transparent'
                  }`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PromotionsProps {
  promotions: string[];
}

const Promotions: React.FC<PromotionsProps> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) return null;

  const [title, ...items] = promotions;
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <div className="mt-2 text-sm text-blue-700">
            <ul className="list-disc pl-5 space-y-1">
              {items.map((promo, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: promo }} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionButtonsProps {
  product: {
    productId: string;
    productName: string;
    price: number;
    color: string | null;
    productType: string;
    quantity?: number;
  };
  showNotification: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ product, showNotification }) => {
  const { user, isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    console.log('Adding to cart:', { productId: product.productId, color: product.color, productType: product.productType });

    const cartItem: CartItem = {
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: 1,
      color: product.color === 'default' || !product.color ? 'Không xác định' : product.color,
      available: true,
    };

    setIsAddingToCart(true);
    try {
      await addItemToCart(user?.id || 'guest', cartItem, isAuthenticated);
      showNotification('Đã thêm vào giỏ hàng!', 'success');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showNotification(error.message || 'Lỗi khi thêm vào giỏ hàng', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isOutOfStock = (product.quantity || 0) <= 0;

  return (
    <div className="mt-10">
      <div className="flex space-x-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || isOutOfStock}
          className={`max-w-xs flex-1 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isOutOfStock
              ? 'bg-gray-400 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang thêm...
            </>
          ) : isOutOfStock ? (
            'Hết hàng'
          ) : (
            'Thêm vào giỏ hàng'
          )}
        </button>

        <button
          disabled={isOutOfStock}
          className={`max-w-xs flex-1 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isOutOfStock
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
          }`}
        >
          {isOutOfStock ? 'Không thể mua' : 'Mua ngay'}
        </button>
      </div>

      
    </div>
  );
};

// Key Features Component
interface KeyFeaturesProps {
  product: Product;
}

const KeyFeatures: React.FC<KeyFeaturesProps> = ({ product }) => {
  if (!product.specifications || product.specifications.length === 0) {
    return null;
  }

  // Get first few important specifications
  const keySpecs = product.specifications.slice(0, 4);

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h3 className="text-sm font-medium text-gray-900">Thông số nổi bật</h3>
      <div className="mt-4 prose prose-sm text-gray-500">
        <ul className="space-y-2">
          {keySpecs.map((spec, index) => (
            <li key={index} className="flex">
              <span className="flex-shrink-0 w-1/3 font-medium text-gray-900">
                {spec.name || spec.ori_name}:
              </span>
              <span className="flex-1">
                {Array.isArray(spec.value) ? spec.value.join(', ') : spec.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Product Tabs Component
interface ProductTabsProps {
  activeTab: 'overview' | 'specifications' | 'reviews';
  onTabChange: (tab: 'overview' | 'specifications' | 'reviews') => void;
  product: Product;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ activeTab, onTabChange, product }) => {
  const tabs = [
    { id: 'overview', name: 'Tổng quan', count: null },
    { id: 'specifications', name: 'Thông số kỹ thuật', count: product.specifications?.length || 0 },
    { id: 'reviews', name: 'Bài viết đánh giá', count: product.productReviews?.length || 0 },
  ] as const;

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mô tả sản phẩm</h3>
                <p className="text-gray-700">
                  {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Thương hiệu</dt>
                    <dd className="text-sm text-gray-900">{product.brand}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Thời điểm ra mắt</dt>
                    <dd className="text-sm text-gray-900">{product.release || 'Chưa cập nhật'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Loại sản phẩm</dt>
                    <dd className="text-sm text-gray-900 capitalize">{product.type}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div>
            <ProductSpecifications specifications={product.specifications} />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <ProductReviewsSection productReviews={product.productReviews || []} />
            <ProductReview />
          </div>
        )}
      </div>
    </div>
  );
};

// Component hiển thị Product Reviews
interface ProductReviewsSectionProps {
  productReviews: { title: string; content: string }[];
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productReviews }) => {
  if (!productReviews || productReviews.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.542l-3.422 1.14a.727.727 0 01-.928-.928l1.14-3.422A8.13 8.13 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có đánh giá</h3>
        <p className="mt-2 text-sm text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {productReviews.map((review, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-blue-600 mb-2">{review.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{review.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductDetail;