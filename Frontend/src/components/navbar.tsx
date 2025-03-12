import React, { useState } from 'react';

import '../styles/navbar.css';

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
          <a href="#" className="account-btn"> 
            <img src="/images/navbar/user-light.svg" alt="account" />
          </a>
          
        </div>
      </div>
    </header>
  );
};

export default Navbar;