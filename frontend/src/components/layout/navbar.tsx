import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';

// Component Navbar
const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  // Get unique item count (distinct by productId and color)
  const uniqueItemCount = useCartStore((state) => {
    const uniqueItems = new Set(
      state.items.map((item) => `${item.productId}-${item.color}`)
    );
    return uniqueItems.size;
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Ecommerce
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/products" className="hover:text-gray-300">
            Sản phẩm
          </Link>
          <Link to="/categories" className="hover:text-gray-300">
            Danh mục
          </Link>
          <Link to="/cart" className="relative hover:text-gray-300">
            <span className="mr-2">🛒</span>
            {uniqueItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {uniqueItemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hover:text-gray-300">
                Tài khoản
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-300">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">
                Đăng nhập
              </Link>
              <Link to="/register" className="hover:text-gray-300">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;