import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import { showNotification } from '../common/Notification';
import SearchBar from '../SearchBar';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unique item count (distinct by productId and color)
  const uniqueItemCount = useCartStore((state) => {
    const uniqueItems = new Set(
      state.items.map((item) => `${item.productId}-${item.color}`)
    );
    return uniqueItems.size;
  });

  // Toggle dropdown on click
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Đăng xuất thành công!', 'success');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      showNotification('Lỗi khi đăng xuất', 'error');
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Ecommerce
        </Link>
        <div className="flex-1 mx-4">
          <SearchBar />
        </div>
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="hover:text-gray-300 focus:outline-none"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                Tài khoản
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-md shadow-lg z-10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-700"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Thông tin
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
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