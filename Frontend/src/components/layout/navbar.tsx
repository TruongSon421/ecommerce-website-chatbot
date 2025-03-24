import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../../styles/navbar.css';

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  console.log("User:", user);
  console.log("localStorage:", localStorage);
  return (
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
          <a href="#" className="search-btn"> 
            <img src="/images/navbar/search-solid.svg" alt="search" />
          </a>
          <a href="#" className="cart-btn"> 
            <img src="/images/navbar/shopping-bag-outline.svg" alt="cart" />
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
                    onClick={logout}
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
  );
};

export default Navbar;