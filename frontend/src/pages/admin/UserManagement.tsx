import React, { useState, useEffect } from 'react';
import AdminUserManagement from '../../components/adminUserManagement/AdminUserManagement';

const UserManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  👥 Quản lý người dùng
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Quản lý tài khoản và thông tin người dùng trong hệ thống
                </p>
              </div>
              
              {/* Quick Stats Badge */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Trang quản trị</div>
                  <div className="text-xs text-blue-500">User Management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Admin</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm font-medium text-gray-900">Quản lý người dùng</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          

          {/* Feature Highlights */}
          

          {/* Admin User Management Component */}
          <div className="bg-white rounded-lg shadow-sm">
            <AdminUserManagement />
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💡</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mẹo sử dụng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">🔍 Tìm kiếm hiệu quả:</h4>
                    <p>Sử dụng từ khóa như tên, email, username hoặc số điện thoại để tìm kiếm nhanh.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">✅ Thao tác hàng loạt:</h4>
                    <p>Chọn nhiều người dùng và thực hiện kích hoạt, vô hiệu hóa hoặc reset mật khẩu cùng lúc.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">👤 Quản lý vai trò:</h4>
                    <p>Phân quyền Admin hoặc User cho từng tài khoản một cách dễ dàng.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">📊 Theo dõi thống kê:</h4>
                    <p>Xem các metrics về người dùng mới, tỷ lệ hoạt động và thông tin tổng quan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Cần hỗ trợ?</h3>
                <p className="text-sm text-gray-600">
                  Liên hệ với đội ngũ kỹ thuật nếu bạn gặp vấn đề trong quá trình sử dụng.
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  📚 Hướng dẫn
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  💬 Liên hệ hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;