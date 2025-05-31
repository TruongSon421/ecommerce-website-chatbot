import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import { showNotification } from '../common/Notification';
import SearchBar from '../product/user/SearchBar';
import { getCartItems, initializeGuestCart } from '../../services/cartService';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, userId } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const uniqueItemCount = useCartStore((state) => state.uniqueItemCount);


  // Load cart items when component mounts
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (isAuthenticated && userId) {
          await getCartItems(userId);
        } else {
          const guestId = await initializeGuestCart();
          await getCartItems(guestId);
        }
      } catch (error) {
        console.error('Failed to load cart items:', error);
        showNotification('Không thể tải giỏ hàng', 'error');
      }
    };

    loadCart();
  }, [isAuthenticated, userId]);

  // Toggle dropdown on click
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Toggle search bar on click
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  // Close dropdown and search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target as Node) &&
        !event.target.closest('.search-bar-container')
      ) {
        setIsSearchOpen(false);
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
        {/* Logo */}
        <Link to="/home" className="text-2xl font-bold">
          Ecommerce
        </Link>

        {/* Centered Categories and Search Button */}
        <div className="flex items-center space-x-4">
          <Link to="/phone" className="hover:text-gray-300">
            Phone
          </Link>
          <Link to="/laptop" className="hover:text-gray-300">
            Laptop
          </Link>
          
          
        </div>

        {/* Account Options */}
        <div className="flex items-center space-x-4">
          <button
            ref={searchButtonRef}
            onClick={toggleSearch}
            className="hover:text-gray-300 focus:outline-none"
            aria-expanded={isSearchOpen}
            aria-label="Toggle search"
          >
            🔍
          </button>
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

      {/* Centered Search Bar */}
      {isSearchOpen && (
        <div className="search-bar-container bg-gray-800 p-4 border-t border-gray-700 flex justify-center">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;