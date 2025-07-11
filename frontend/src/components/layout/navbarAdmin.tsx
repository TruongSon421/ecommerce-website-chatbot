import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showNotification } from '../common/Notification';
import AdminSearchBar from '../product/admin/SearchBarAdmin'; // Import AdminSearchBar

const AdminNavbar: React.FC = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Check if current page should show search icon
  const shouldShowSearchIcon = () => {
    const path = location.pathname;
    return (
      path.startsWith('/admin/detail/') || 
      path.startsWith('/admin/products/') ||
      path === '/admin/products'
    );
  };

  // Toggle dropdown on click
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Toggle product dropdown on click
  const toggleProductDropdown = () => {
    setIsProductDropdownOpen((prev) => !prev);
  };

  // Toggle search popup
  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (shouldShowSearchIcon()) {
          setIsSearchOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showNotification('Đăng xuất thành công!', 'success');
      setIsDropdownOpen(false);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showNotification('Lỗi khi đăng xuất', 'error');
    }
  };

  // Helper function to check if current path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // If not authenticated or not admin, don't render the navbar
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/dashboard" 
                className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Admin Panel
              </Link>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-gray-300 text-sm">Quản lý hệ thống</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Dashboard */}
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📊 Dashboard
              </Link>

              {/* Product Management Dropdown */}
              <div className="relative" ref={productDropdownRef}>
                <button
                  onClick={toggleProductDropdown}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    isActive('/admin/product') || isActive('/admin/products')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  aria-expanded={isProductDropdownOpen}
                  aria-haspopup="true"
                >
                  📦 Quản lý sản phẩm
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isProductDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isProductDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 text-white rounded-md shadow-lg z-20 border border-gray-700">
                    <div className="py-1">
                      <Link
                        to="/admin/product/add"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/product/add') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        ➕ Thêm sản phẩm mới
                      </Link>

                      <Link
<<<<<<< HEAD
=======
                        to="/admin/product/bulk-import"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/product/bulk-import') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        📤 Thêm hàng loạt (Bulk Import)
                      </Link>

                      <Link
>>>>>>> server
                        to="/admin/tag"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/tag') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        🏷️ Quản lý tag
                      </Link>

                      <div className="border-t border-gray-700 my-1"></div>
                      <div className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Quản lý theo danh mục
                      </div>
                      <Link
                        to="/admin/products/phone"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/phone') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        📱 Điện thoại
                      </Link>
                      <Link
                        to="/admin/products/laptop"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/laptop') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        💻 Laptop
                      </Link>
                      <Link
<<<<<<< HEAD
                        to="/admin/products/audio"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/audio') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        🎧 Audio
                      </Link>
                      <Link
                        to="/admin/products/smartwatch"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/smartwatch') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        ⌚ Smartwatch
=======
                        to="/admin/products/audio/wireless_earphone"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/audio/wireless_earphone') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        🎧 Tai nghe
                      </Link>
                      <Link
                        to="/admin/products/phukien/backup_charger"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/phukien/backup_charger') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        🔋 Phụ kiện
>>>>>>> server
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <Link
                        to="/admin/products/all"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/all') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        📋 Tất cả sản phẩm
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders Management */}
              <Link
                to="/admin/orders"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/orders')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🛍️ Đơn hàng
              </Link>

              {/* Users Management */}
              <Link
                to="/admin/users"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                👥 Người dùng
              </Link>

              {/* Reviews Management */}
              <Link
                to="/admin/reviews"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/reviews')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                ⭐ Đánh giá
              </Link>
      
            </div>

            {/* Right side - Search and User menu */}
            <div className="flex items-center space-x-4">
              {/* Search Icon (only show on product pages) */}
              {shouldShowSearchIcon() && (
                <button
                  onClick={toggleSearch}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Tìm kiếm sản phẩm (Ctrl+K)"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Quick Actions */}
              <div className="hidden lg:flex items-center space-x-2">
      
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  🌐 Xem site
                </Link>
              </div>

              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-all duration-200"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-semibold text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white">{user?.email || 'Admin'}</div>
                    <div className="text-xs text-blue-300">Quản trị viên</div>
                  </div>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white text-gray-800 rounded-xl shadow-2xl z-20 border border-gray-200 overflow-hidden">
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-4 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-lg font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user?.email}</div>
                          <div className="text-blue-300 text-sm flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
                            </svg>
                            Quản trị viên
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/admin/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Thông tin cá nhân</div>
                            <div className="text-xs text-gray-500">Xem và chỉnh sửa hồ sơ admin</div>
                          </div>
                        </div>
                      </Link>
                      
                      <Link
                        to="/admin/settings"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Cài đặt hệ thống</div>
                            <div className="text-xs text-gray-500">Quản lý cấu hình website</div>
                          </div>
                        </div>
                      </Link>

                      {/* Divider */}
                      <div className="my-2 border-t border-gray-100"></div>
                      
                      <Link
                        to="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Xem website</div>
                            <div className="text-xs text-gray-500">Mở trang web khách hàng</div>
                          </div>
                        </div>
                      </Link>

                      {/* Divider */}
                      <div className="my-2 border-t border-gray-100"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Đăng xuất</div>
                            <div className="text-xs text-red-400">Thoát khỏi tài khoản admin</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
              {/* Mobile Search Button */}
              {shouldShowSearchIcon() && (
                <button
                  onClick={toggleSearch}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  🔍 Tìm kiếm sản phẩm
                </button>
              )}
              
              <Link
                to="/admin/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin/dashboard')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/admin/products/all"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin/products/all')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📋 Quản lý sản phẩm
              </Link>
              <Link
                to="/admin/orders"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin/orders')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🛍️ Đơn hàng
              </Link>
              <Link
                to="/admin/users"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin/users')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                👥 Người dùng
              </Link>
              <Link
                to="/admin/reviews"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin/reviews')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                ⭐ Đánh giá
              </Link>
            </div>
          </div>
        </div>

        {/* Breadcrumb (Optional) */}
        {location.pathname !== '/admin/dashboard' && (
          <div className="bg-gray-800 border-t border-gray-700">
            <div className="container mx-auto px-4 py-2">
              <nav className="text-sm">
                <ol className="flex items-center space-x-2 text-gray-400">
                  <li>
                    <Link to="/admin/dashboard" className="hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                  {location.pathname.includes('/admin/product') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-gray-300">Sản phẩm</span>
                      </li>
                      {location.pathname.includes('/add') && (
                        <>
                          <li>
                            <span className="mx-2">/</span>
                            <span className="text-white">Thêm mới</span>
                          </li>
                        </>
                      )}
                    </>
                  )}
                  {location.pathname.includes('/admin/products/') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-gray-300">Danh mục</span>
                      </li>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-white capitalize">
                          {location.pathname.split('/').pop()}
                        </span>
                      </li>
                    </>
                  )}
                  {location.pathname.includes('/admin/detail/') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-gray-300">Chi tiết sản phẩm</span>
                      </li>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-white capitalize">
                          {location.pathname.split('/')[3]}
                        </span>
                      </li>
                    </>
                  )}
                  {location.pathname.includes('/admin/orders') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-white">Quản lý đơn hàng</span>
                      </li>
                    </>
                  )}
                  {location.pathname.includes('/admin/users') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-white">Quản lý người dùng</span>
                      </li>
                    </>
                  )}
                  {location.pathname.includes('/admin/reviews') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-white">Quản lý đánh giá</span>
                      </li>
                    </>
                  )}
                  {location.pathname.includes('/admin/analytics') && (
                    <>
                      <li>
                        <span className="mx-2">/</span>
                        <span className="text-white">Thống kê</span>
                      </li>
                    </>
                  )}
                </ol>
              </nav>
            </div>
          </div>
        )}
      </nav>

      {/* Search Popup */}
      <AdminSearchBar 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default AdminNavbar;