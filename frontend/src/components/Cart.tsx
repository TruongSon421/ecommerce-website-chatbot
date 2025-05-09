import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import { getCartItems, updateCartItem, removeItemFromCart, clearCart, mergeCart } from '../services/cartService';
import { CartItem } from '../types/cart';
import { showNotification } from './common/Notification';

const Cart: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch or merge cart items on mount
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isAuthenticated && user?.id) {
          // Merge local cart with server cart
          await mergeCart(user.id);
        }
        // Fetch latest cart items
        const items = await getCartItems(isAuthenticated);
        if (!isAuthenticated) {
          useCartStore.getState().mergeCart(items);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
        setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
        showNotification('Không thể tải giỏ hàng', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, user?.id]);

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      if (isAuthenticated) {
        // Call API to update server cart
        await updateCartItem(item.productId, newQuantity, item.color);
      } else {
        // Update local cart only
        const updatedItem: CartItem = { ...item, quantity: newQuantity };
        useCartStore.getState().addItem(updatedItem);
      }
      showNotification(`Cập nhật số lượng ${item.productName} thành công!`, 'success');
    } catch (err) {
      console.error('Failed to update quantity:', err);
      showNotification('Lỗi khi cập nhật số lượng', 'error');
    }
  };

  const handleRemoveItem = async (productId: string, color: string) => {
    try {
      if (isAuthenticated) {
        // Call API to remove from server cart
        await removeItemFromCart(productId, color);
      } else {
        // Remove from local cart
        const updatedItems = cartItems.filter(
          (item) => !(item.productId === productId && item.color === color)
        );
        useCartStore.getState().mergeCart(updatedItems);
      }
      showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
    } catch (err) {
      console.error('Failed to remove item:', err);
      showNotification('Lỗi khi xóa sản phẩm', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      if (isAuthenticated) {
        // Call API to clear server cart
        await clearCart();
      } else {
        // Clear local cart
        useCartStore.getState().clearCart();
      }
      showNotification('Đã xóa toàn bộ giỏ hàng!', 'success');
    } catch (err) {
      console.error('Failed to clear cart:', err);
      showNotification('Lỗi khi xóa giỏ hàng', 'error');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
        <button
          onClick={() => fetchCart()}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <div className="text-center p-4">Giỏ hàng của bạn đang trống.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {cartItems.map((item) => (
          <div
            key={`${item.productId}-${item.color}`}
            className="flex items-center border-b p-4"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{item.productName}</h3>
              <p className="text-gray-600">Màu: {item.color}</p>
              <p className="text-gray-600">Giá: {item.price.toLocaleString('vi-VN')} ₫</p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded-l"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded-r"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-lg font-semibold">
                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
              </p>
              <button
                onClick={() => handleRemoveItem(item.productId, item.color)}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleClearCart}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Xóa giỏ hàng
        </button>
        <div className="text-lg font-semibold">
          Tổng cộng: {totalPrice.toLocaleString('vi-VN')} ₫
        </div>
      </div>
    </div>
  );
};

export default Cart;