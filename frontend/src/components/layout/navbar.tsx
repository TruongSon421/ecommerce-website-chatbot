import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import SearchBar from '../product/user/SearchBar';
import '../../styles/navbar.css';

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCartStore();
  
  // Calculate number of unique products in cart (not total quantity)
  const totalItemsInCart = items.length;
  
  const handleLogout = async () => {
    await logout();
    console.log("After logout - User:", user);
    console.log("After logout - localStorage:", localStorage);
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSearchBar(true);
    // Close mobile menu if open
    setShowMobileMenu(false);
    // Close dropdown if open
    setShowDropdown(false);
  };

  const handleCloseSearchBar = () => {
    setShowSearchBar(false);
  };

  // Close dropdown when clicking outside or on mobile menu
  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
    if (showDropdown) {
      setShowDropdown(false);
    }
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <button 
            className="mobile-menu-btn" 
            onClick={handleMobileMenuToggle}
          >
            <img
              src={showMobileMenu ? "/images/navbar/close-circle-outline.svg" : "/images/navbar/menu.svg"}
              alt="menu"
              className="menu-icon"
            />
          </button>
          
          <div className="logo">
            <a href="/">
              <img src="/images/google-nexus.svg" alt="Nexus Logo" className='logo-img' />
            </a>
          </div>
          
          <nav className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
            <ul>
              <li><a href="/phone">Phone</a></li>
              <li><a href="/laptop">Laptop</a></li>
              <li><a href="/tablet">Tablet</a></li>
              <li><a href="/audio">Audio</a></li>
              <li><a href="/phukien">Phụ kiện</a></li>
            </ul>
          </nav>
          
          <div className="nav-actions">
            <button 
              onClick={handleSearchClick} 
              className="search-btn hover:bg-gray-100 transition-colors duration-200 p-2 rounded-md" 
              title="Tìm kiếm"
            > 
              <img src="/images/navbar/search-solid.svg" alt="search" className="w-5 h-5" />
            </button>
            
            <a href="/cart" className="cart-btn relative hover:bg-gray-100 transition-colors duration-200 p-2 rounded-md" title="Giỏ hàng"> 
              <img src="/images/navbar/shopping-bag-outline.svg" alt="cart" className="w-5 h-5" />
              {totalItemsInCart > 0 && (
                <span className="cart-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItemsInCart > 99 ? '99+' : totalItemsInCart}
                </span>
              )}
            </a>
            
            {/* Nếu user đã đăng nhập, hiển thị thông tin tài khoản */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={handleDropdownToggle}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 p-2 rounded-md"
                  title="Tài khoản"
                >
                  <img src="/images/navbar/user-light.svg" alt="account" className="w-5 h-5" />
                  <span className="hidden md:inline">{user.username}</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-30 md:hidden" 
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-40">
                      <div className="py-1">
                        <a 
                          href="/profile" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile</span>
                          </div>
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a 
                href="/login" 
                className="login-btn hover:bg-gray-100 transition-colors duration-200 p-2 rounded-md"
                title="Đăng nhập"
              >
                <img src="/images/navbar/user-light.svg" alt="login" className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar Popup */}
      <SearchBar 
        isOpen={showSearchBar} 
        onClose={handleCloseSearchBar} 
      />
    </>
  );
};

export default Navbar;