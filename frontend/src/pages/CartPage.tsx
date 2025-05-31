import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import { updateCartItem, removeItemFromCart, clearCart, getGuestId } from '../services/cartService';
import { CartItem } from '../types/cart';

const CartPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { items, selectedItems, toggleSelectItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get userId for both authenticated and guest users
  const getUserId = (): string => {
    if (isAuthenticated && user?.id) {
      return user.id;
    } else {
      const guestId = getGuestId();
      if (!guestId) {
        throw new Error('Guest ID not found. Please refresh the page.');
      }
      return guestId;
    }
  };

  // Tính tổng giá của các sản phẩm được chọn
  const totalPrice = items
    .filter((item) => selectedItems.includes(`${item.productId}-${item.color}`))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = async (productId: string, color: string, quantity: number) => {
    if (quantity < 1) return;
    setIsLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      console.log('Updating quantity:', { productId, color, quantity, userId, isAuthenticated });
      await updateCartItem(userId, { productId, color, quantity } as CartItem, isAuthenticated);
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể cập nhật số lượng';
      console.error('Failed to update quantity:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string, color: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      console.log('Removing item:', { productId, color, userId, isAuthenticated });
      await removeItemFromCart(userId, productId, color, isAuthenticated);
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể xóa sản phẩm';
      console.error('Failed to remove item:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      console.log('Clearing cart:', { userId, isAuthenticated });
      await clearCart(userId, isAuthenticated);
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể xóa giỏ hàng';
      console.error('Failed to clear cart:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: { selectedItems: items.filter((item) => selectedItems.includes(`${item.productId}-${item.color}`)) },
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {items.length === 0 ? (
        <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex items-center border-b py-4 bg-gray-50 rounded-md p-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(`${item.productId}-${item.color}`)}
                  onChange={() => toggleSelectItem(item.productId,item.color)}
                  className="mr-4 h-5 w-5"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.productName}</h3>
                  {item.color!=="Không xác định" && <p className="text-gray-500">Màu: {item.color}</p>}
                  <p className="text-gray-500">
                    Giá: {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.productId, item.color, parseInt(e.target.value))}
                    className="w-16 border rounded p-1"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleRemoveItem(item.productId, item.color)}
                    className="text-red-600 hover:text-red-800"
                    disabled={isLoading}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xl font-semibold mb-4 sm:mb-0">
              Tổng cộng: {totalPrice.toLocaleString('vi-VN')} ₫
            </p>
            <div className="space-x-4">
              <button
                onClick={handleClearCart}
                className="border-2 border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Xóa tất cả
              </button>
              <button
                onClick={handleCheckout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CartPage;