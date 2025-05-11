import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { getCartItems, removeItemFromCart } from '../services/cartService';
import { useCartStore } from '../store/cartStore';
import { CartItem } from '../types/cart';
import { showNotification } from './common/Notification';

interface ProductDetails {
  productId: string;
  productName: string;
  price: number;
  type: string;
}

const Cart: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const [productDetails, setProductDetails] = useState<Map<string, ProductDetails>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items for authenticated users
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated && user?.id) {
        setIsLoading(true);
        try {
          await getCartItems(user.id);
        } catch (err: any) {
          console.error('Failed to fetch cart:', err);
          setError(err.message || 'Không thể tải giỏ hàng');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCart();
  }, [isAuthenticated, user?.id]);

  // Fetch product details for cart items
  useEffect(() => {
    const fetchProductDetails = async () => {
      const detailsMap = new Map<string, ProductDetails>();
      const uniqueProductIds = [...new Set(cartItems.map((item) => item.productId))];

      for (const productId of uniqueProductIds) {
        // Find the type from the first cart item with this productId
        const item = cartItems.find((i) => i.productId === productId);
        console.log(item)

        try {
          const response = await fetch(`http://localhost:8070/api/products/get/${item?.type}/${productId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data: { productId: string; productName: string; current_prices: number[]; type: string } = await response.json();
          detailsMap.set(productId, {
            productId,
            productName: data.productName,
            price: data.current_prices[0] || 0, // Use first price; adjust for color-specific prices
            type: data.type,
          });
        } catch (err: any) {
          console.error(`Failed to fetch product ${productId}:`, err);
          detailsMap.set(productId, {
            productId,
            productName: 'Sản phẩm không xác định',
            price: 0,
            type: productType,
          });
        }
      }

      setProductDetails(detailsMap);
    };

    if (cartItems.length > 0) {
      fetchProductDetails();
    } else {
      setProductDetails(new Map());
    }
  }, [cartItems]);

  const handleRemoveItem = async (productId: string, color: string) => {
    try {
      if (isAuthenticated && user?.id) {
        await removeItemFromCart(user.id, productId, color);
        showNotification('Đã xóa khỏi giỏ hàng!', 'success');
      } else {
        useCartStore.getState().removeItem(productId, color);
        showNotification('Đã xóa khỏi giỏ hàng (khách)!', 'success');
      }
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi xóa khỏi giỏ hàng', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <button
          onClick={() => user?.id && getCartItems(user.id)}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <div className="p-4 text-center">Giỏ hàng của bạn trống.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Giỏ Hàng</h1>
      <div className="space-y-4">
        {cartItems.map((item: CartItem, index: number) => {
          const product = productDetails.get(item.productId);
          return (
            <div
              key={`${item.productId}-${item.color}-${index}`}
              className="flex items-center border-b py-4"
            >
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {product?.productName || 'Đang tải...'}
                </h2>
                <p className="text-gray-600">Màu: {item.color}</p>
                <p className="text-gray-600">Số lượng: {item.quantity}</p>
                <p className="text-lg font-bold">
                  Giá:{' '}
                  {product?.price != null
                    ? product.price.toLocaleString('vi-VN') + ' ₫'
                    : 'Không xác định'}
                </p>
              </div>
              <button
                onClick={() => handleRemoveItem(item.productId, item.color)}
                className="text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <p className="text-xl font-bold">
          Tổng cộng:{' '}
          {cartItems
            .reduce((total, item) => {
              const price = productDetails.get(item.productId)?.price || 0;
              return total + price * item.quantity;
            }, 0)
            .toLocaleString('vi-VN')}{' '}
          ₫
        </p>
        <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Thanh Toán
        </button>
      </div>
    </div>
  );
};

export default Cart;