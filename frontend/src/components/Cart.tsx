import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useCartStore } from '../store/cartStore';
import { updateCartItem, removeItemFromCart, clearCart } from '../services/cartService';
import { CartItem } from '../types/cart';

const Cart: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = async (productId: string, color: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      console.log('Updating quantity:', { productId, color, quantity, userId: user?.id || 'guest', isAuthenticated });
      await updateCartItem(user?.id || 'guest', { productId, color, quantity } as CartItem, isAuthenticated);
    } catch (error: any) {
      console.error('Failed to update quantity:', error.message);
    }
  };

  const handleRemoveItem = async (productId: string, color: string) => {
    try {
      console.log('Removing item:', { productId, color, userId: user?.id || 'guest', isAuthenticated });
      await removeItemFromCart(user?.id || 'guest', productId, color, isAuthenticated);
    } catch (error: any) {
      console.error('Failed to remove item:', error.message);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart(user?.id || 'guest', isAuthenticated);
    } catch (error: any) {
      console.error('Failed to clear cart:', error.message);
    }
  };

  return (
    <div className="bg-white p-8 ml-24 mr-24">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.color}`} className="flex items-center border-b py-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.productName}</h3>
                  <p className="text-gray-500">Màu: {item.color}</p>
                  <p className="text-gray-500">Giá: {(item.price * item.quantity).toLocaleString('vi-VN')} ₫</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.productId, item.color, parseInt(e.target.value))}
                    className="w-16 border rounded p-1"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.productId, item.color)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-semibold">Tổng cộng: {totalPrice.toLocaleString('vi-VN')} ₫</p>
            <div className="space-x-4">
              <button
                onClick={handleClearCart}
                className="border-2 border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50"
              >
                Xóa tất cả
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;