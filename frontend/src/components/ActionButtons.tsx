import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { addItemToCart } from '../services/cartService';
import { CartItem } from '../types/cart';

interface ActionButtonsProps {
  product: {
    productId: string;
    productName: string;
    price: number;
    color: string;
  };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    const cartItem: CartItem = {
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: 1,
      color: product.color,
      isAvailable: true, // Assume item is available; adjust if backend provides this info
    };

    try {
      await addItemToCart(cartItem, isAuthenticated);
    //   alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Lỗi khi thêm vào giỏ hàng');
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

export default ActionButtons;