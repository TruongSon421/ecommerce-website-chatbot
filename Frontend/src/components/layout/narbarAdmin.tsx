// src/components/AdminNavbar.tsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Users", path: "/admin/users" },
    {
      label: "Products",
      path: "/admin/products",
      dropdown: [
        { label: "List Products", path: "/admin/products" },
        { label: "Add Product", path: "/admin/product/add" },
      ],
    },
    { label: "Orders", path: "/admin/orders" },
    { label: "Promotions", path: "/admin/promotions" },
    { label: "Inventory", path: "/admin/inventory" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <NavLink to="/admin/dashboard" className="text-xl font-bold">
          Admin Panel
        </NavLink>

        {/* Menu desktop */}
        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <div key={item.path} className="relative">
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {item.label}
                  </button>
                  {isProductDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                      {item.dropdown.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block px-4 py-2 hover:bg-gray-600 rounded-md ${
                              isActive ? "text-blue-400" : ""
                            }`
                          }
                          onClick={() => setIsProductDropdownOpen(false)}
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `hover:text-gray-300 transition-colors ${
                      isActive ? "text-blue-400 font-semibold" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/admin/login" className="hover:text-gray-300">
                Login
              </NavLink>
              <NavLink to="/admin/register" className="hover:text-gray-300">
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Menu mobile */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Dropdown mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.path}>
              {item.dropdown ? (
                <>
                  <button
                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                    className="block w-full text-left py-2 px-4 hover:bg-gray-700 rounded-md"
                  >
                    {item.label}
                  </button>
                  {isProductDropdownOpen && (
                    <div className="ml-4 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block py-2 px-4 hover:bg-gray-600 rounded-md ${
                              isActive ? "text-blue-400" : ""
                            }`
                          }
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-2 px-4 hover:bg-gray-700 rounded-md ${
                      isActive ? "bg-gray-700 text-blue-400" : ""
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/admin/login"
                className="block py-2 px-4 hover:bg-gray-700 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </NavLink>
              <NavLink
                to="/admin/register"
                className="block py-2 px-4 hover:bg-gray-700 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;