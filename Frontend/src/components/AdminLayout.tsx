import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="p-4 flex justify-between items-center">
          <h2 className={`font-semibold text-xl ${sidebarOpen ? 'block' : 'hidden'}`}>Admin Panel</h2>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 rounded-md hover:bg-gray-700"
          >
            {sidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2">
            <Link
              to="/trang-admin-ban-hang/dashboard"
              className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              {sidebarOpen && "Dashboard"}
            </Link>
            
            <Link
              to="/trang-admin-ban-hang/products"
              className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {sidebarOpen && "Sản phẩm"}
            </Link>
            
            <Link
              to="/trang-admin-ban-hang/categories"
              className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {sidebarOpen && "Danh mục"}
            </Link>
            
            <Link
              to="/trang-admin-ban-hang/orders"
              className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {sidebarOpen && "Đơn hàng"}
            </Link>
            
            <Link
              to="/trang-admin-ban-hang/users"
              className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {sidebarOpen && "Người dùng"}
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 rounded-md w-full text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && "Đăng xuất"}
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline text-gray-700">
                {authState.user?.username}
              </span>
              <button className="p-1 rounded-full bg-gray-200 focus:outline-none focus:ring">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://via.placeholder.com/40"
                  alt="User"
                />
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;