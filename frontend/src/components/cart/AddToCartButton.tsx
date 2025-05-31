import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addItemToCart, getGuestId } from '../../services/cartService';
import { CartItem } from '../../types/cart';
import Notification from '../common/Notification';

interface AddToCartButtonsProps {
  product: {
    productId: string;
    productName: string;
    price: number;
    color: string;
  };
}

const AddToCartButtons: React.FC<AddToCartButtonsProps> = ({ product }) => {
  const { isAuthenticated, user } = useAuth();
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'error' | 'warning' | 'info' | 'success'
  });

  const showNotification = (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleAddToCart = async () => {
    const cartItem: CartItem = {
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: 1,
      color: product.color,
      available: true,
    };

    try {
      // Determine user ID: use actual user ID if authenticated, or guestId if not
      let userId: string;
      if (isAuthenticated && user?.id) {
        userId = user.id;
      } else {
        const guestId = getGuestId();
        if (!guestId) {
          throw new Error('Guest ID not found. Please refresh the page.');
        }
        userId = guestId;
      }
      
      await addItemToCart(userId, cartItem, isAuthenticated);
      console.log('Item added to cart successfully');
      showNotification('Đã thêm sản phẩm vào giỏ hàng thành công!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!', 'error');
    }
  };

  return (
    <>
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
      
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </>
  );
};

export default AddToCartButtons;