import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import SearchBar from '../product/user/SearchBar';
import '../../styles/navbar.css';

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
    // Close mobile menu if open
    setShowMobileMenu(false);
    // Close dropdown if open
    setShowDropdown(false);
    setShowAudioDropdown(false);
    setShowAccessoryDropdown(false);
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
    if (showAudioDropdown) {
      setShowAudioDropdown(false);
    }
    if (showAccessoryDropdown) {
      setShowAccessoryDropdown(false);
    }
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
    if (showMobileMenu) {
      setShowMobileMenu(false);
    }
    if (showAudioDropdown) {
      setShowAudioDropdown(false);
    }
    if (showAccessoryDropdown) {
      setShowAccessoryDropdown(false);
    }
  };

  const handleAudioDropdownToggle = () => {
    setShowAudioDropdown(!showAudioDropdown);
    if (showDropdown) {
      setShowDropdown(false);
    }
    if (showAccessoryDropdown) {
      setShowAccessoryDropdown(false);
    }
  };

  const handleAccessoryDropdownToggle = () => {
    setShowAccessoryDropdown(!showAccessoryDropdown);
    if (showDropdown) {
      setShowDropdown(false);
    }
    if (showAudioDropdown) {
      setShowAudioDropdown(false);
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
              <li className="relative">
                <button 
                  onClick={handleAudioDropdownToggle}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
                >
                  <span>Audio</span>
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
                {showAudioDropdown && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-30 md:hidden" 
                      onClick={() => setShowAudioDropdown(false)}
                    />
                    
                    <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40">
                      <div className="py-1">
                        <a 
                          href="/audio/wireless_earphone" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 12.536a9 9 0 010-1.072m0 1.072a9 9 0 00-2.828 2.828m2.828-2.828L12 8.464m3.536 4.072L20 8m-6 6L12 8.464M8.464 12.536a9 9 0 010-1.072m0 1.072a9 9 0 012.828 2.828M8.464 11.464L12 8.464M8.464 11.464L4 8m4.464 3.464L12 8.464" />
                            </svg>
                            <span>Wireless Earphone</span>
                          </div>
                        </a>
                        <a 
                          href="/audio/wired_earphone" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span>Wired Earphone</span>
                          </div>
                        </a>
                        <a 
                          href="/audio/headphone" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13V10a7 7 0 0114 0v3m-9 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2h2a2 2 0 012 2zm9 0v5a2 2 0 002 2h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2z" />
                            </svg>
                            <span>Headphone</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </li>
              <li className="relative">
                <button 
                  onClick={handleAccessoryDropdownToggle}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200"
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
                {showAccessoryDropdown && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-30 md:hidden" 
                      onClick={() => setShowAccessoryDropdown(false)}
                    />
                    
                    <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-40">
                      <div className="py-1">
                        <a 
                          href="/phukien/backup_charger" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1.73 2 2 0 011 0V7a2 2 0 012 2" />
                            </svg>
                            <span>Backup Charger</span>
                          </div>
                        </a>
                        <a 
                          href="/phukien/cable_charger_hub" 
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                            <span>Cable Charger Hub</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </li>
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
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 p-2 rounded-lg border border-transparent hover:border-blue-200"
                  title="Tài khoản"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-800">{user.username}</span>
                    <span className="text-xs text-gray-500">Khách hàng</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transform transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-30 md:hidden" 
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {user.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">{user.username}</div>
                            <div className="text-blue-100 text-xs">Khách hàng</div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <a 
                          href="/profile" 
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                          onClick={() => setShowDropdown(false)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors flex-shrink-0">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">Thông tin cá nhân</span>
                          </div>
                        </a>
                        
                        <a 
                          href="/purchase-history" 
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                          onClick={() => setShowDropdown(false)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="w-7 h-7 rounded-lg bg-green-50 group-hover:bg-green-100 flex items-center justify-center transition-colors flex-shrink-0">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">Lịch sử mua hàng</span>
                          </div>
                        </a>

                        {/* Divider */}
                        <div className="my-1.5 border-t border-gray-100"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium whitespace-nowrap">Đăng xuất</span>
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