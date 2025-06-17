import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import SearchBar from '../product/user/SearchBar';
import '../../styles/navbar.css';

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAudioDropdown, setShowAudioDropdown] = useState(false);
  const [showAccessoryDropdown, setShowAccessoryDropdown] = useState(false);
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
    closeAllDropdowns();
    setShowMobileMenu(false);
  };

  const handleCloseSearchBar = () => {
    setShowSearchBar(false);
  };

  const closeAllDropdowns = () => {
    setShowUserDropdown(false);
    setShowAudioDropdown(false);
    setShowAccessoryDropdown(false);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
    closeAllDropdowns();
  };

  const handleUserDropdownToggle = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowAudioDropdown(false);
    setShowAccessoryDropdown(false);
    setShowMobileMenu(false);
  };

  const handleAudioDropdownToggle = () => {
    setShowAudioDropdown(!showAudioDropdown);
    setShowUserDropdown(false);
    setShowAccessoryDropdown(false);
  };

  const handleAccessoryDropdownToggle = () => {
    setShowAccessoryDropdown(!showAccessoryDropdown);
    setShowUserDropdown(false);
    setShowAudioDropdown(false);
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
              <img src="/images/techzone-logo.png" alt="TechZone Logo" className='logo-img' />
            </a>
          </div>
          
          <nav className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
            <ul>
              <li><a href="/phone">Điện thoại</a></li>
              <li><a href="/laptop">Máy tính</a></li>
              
              {/* Audio Dropdown */}
              <li className="relative">
                <button 
                  onClick={handleAudioDropdownToggle}
                  className="flex items-center space-x-1"
                >
                  <span>Âm thanh</span>
                  <svg 
                    className={`w-4 h-4 transform transition-transform duration-200 ${showAudioDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Audio Dropdown Menu */}
                <div className={`dropdown-menu ${showAudioDropdown ? 'active' : ''}`}>
                  <a href="/audio/wireless_earphone" className="dropdown-item">
                    <span>Wireless Earphone</span>
                  </a>
                  <a href="/audio/wired_earphone" className="dropdown-item">
                    <span>Wired Earphone</span>
                  </a>
                  <a href="/audio/headphone" className="dropdown-item">
                    <span>Headphone</span>
                  </a>
                </div>
              </li>
              
              {/* Accessory Dropdown */}
              <li className="relative">
                <button 
                  onClick={handleAccessoryDropdownToggle}
                  className="flex items-center space-x-1"
                >
                  <span>Phụ kiện</span>
                  <svg 
                    className={`w-4 h-4 transform transition-transform duration-200 ${showAccessoryDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Accessory Dropdown Menu */}
                <div className={`dropdown-menu ${showAccessoryDropdown ? 'active' : ''}`}>
                  <a href="/phukien/backup_charger" className="dropdown-item">
                    <span>Backup Charger</span>
                  </a>
                </div>
              </li>
            </ul>
          </nav>
          
          <div className="nav-actions">
            <button 
              onClick={handleSearchClick} 
              className="search-btn" 
              title="Tìm kiếm"
            > 
              <img src="/images/navbar/search-solid.svg" alt="search" className="w-5 h-5" />
            </button>
            
            <a href="/cart" className="cart-btn relative" title="Giỏ hàng"> 
              <img src="/images/navbar/shopping-bag-outline.svg" alt="cart" className="w-5 h-5" />
              {totalItemsInCart > 0 && (
                <span className="cart-badge">
                  {totalItemsInCart > 99 ? '99+' : totalItemsInCart}
                </span>
              )}
            </a>
            
            {/* User Account */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={handleUserDropdownToggle}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 p-2 rounded-lg border border-transparent hover:border-blue-200"
                  title="Tài khoản"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-white">{user.username}</span>
                    <span className="text-xs text-gray-300">Khách hàng</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transform transition-transform duration-200 text-white ${showUserDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                <div className={`user-dropdown ${showUserDropdown ? 'active' : ''}`}>
                  {/* User Info Header */}
                  <div className="user-dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{user.username}</div>
                        <div className="text-blue-100 text-xs">Khách hàng</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="user-dropdown-menu">
                    <a 
                      href="/profile" 
                      className="user-dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Thông tin cá nhân</span>
                    </a>
                    
                    <a 
                      href="/purchase-history" 
                      className="user-dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" />
                      </svg>
                      <span>Lịch sử mua hàng</span>
                    </a>
                    
                    <button
                      onClick={handleLogout}
                      className="user-dropdown-item logout w-full text-left"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <a 
                href="/login" 
                className="login-btn"
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
      
      {/* Backdrop for closing dropdowns */}
      {(showAudioDropdown || showAccessoryDropdown || showUserDropdown) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={closeAllDropdowns}
        />
      )}
    </>
  );
};

export default Navbar;