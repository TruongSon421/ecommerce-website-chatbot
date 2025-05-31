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
                        to="/admin/products/tablet"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/tablet') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        📟 Tablet
                      </Link>
                      <Link
                        to="/admin/products/smartwatch"
                        className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                          isActive('/admin/products/smartwatch') ? 'bg-blue-600' : ''
                        }`}
                        onClick={() => setIsProductDropdownOpen(false)}
                      >
                        ⌚ Smartwatch
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

              {/* Analytics */}
              <Link
                to="/admin/analytics"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin/analytics')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📈 Thống kê
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
                  to="/admin/product/add"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  ➕ Thêm SP
                </Link>
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
                  className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.email || 'Admin'}</div>
                    <div className="text-xs text-gray-400">Quản trị viên</div>
                  </div>
                  <svg
                    className={`h-4 w-4 transition-transform ${
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
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 text-white rounded-md shadow-lg z-20 border border-gray-700">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="text-sm font-medium">{user?.email}</div>
                        <div className="text-xs text-gray-400">Quản trị viên</div>
                      </div>
                      <Link
                        to="/admin/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        👤 Thông tin cá nhân
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        ⚙️ Cài đặt hệ thống
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <Link
                        to="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        🌐 Xem website
                      </Link>
                      <div className="border-t border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-red-600 hover:text-white transition-colors text-red-400"
                      >
                        🚪 Đăng xuất
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
                to="/admin/product/add"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/admin/product/add')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                ➕ Thêm sản phẩm
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