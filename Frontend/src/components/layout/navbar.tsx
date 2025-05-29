import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCartStore } from '../../store/cartStore';
import SearchPopup from '../search/SearchPopup';
import '../../styles/navbar.css';

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
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
    setShowSearchPopup(true);
  };

  const handleCloseSearchPopup = () => {
    setShowSearchPopup(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
        <button 
              className="mobile-menu-btn" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
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
            <button onClick={handleSearchClick} className="search-btn"> 
              <img src="/images/navbar/search-solid.svg" alt="search" />
            </button>
            <a href="/cart" className="cart-btn relative"> 
              <img src="/images/navbar/shopping-bag-outline.svg" alt="cart" />
              {totalItemsInCart > 0 && (
                <span className="cart-badge">
                  {totalItemsInCart > 99 ? '99+' : totalItemsInCart}
                </span>
              )}
            </a>
            {/*  Nếu user đã đăng nhập, hiển thị thông tin tài khoản */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <img src="/images/navbar/user-light.svg" alt="account" className="w-6 h-6" />
                  <span>{user.username}</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-40">
                    <a href="/profile" className='profile block px-4 py-2 text-gray-700' >
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="login-btn">
                <img src="/images/navbar/user-light.svg" alt="login" className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Search Popup */}
      <SearchPopup 
        isOpen={showSearchPopup} 
        onClose={handleCloseSearchPopup} 
      />
    </>
  );
};

export default Navbar;