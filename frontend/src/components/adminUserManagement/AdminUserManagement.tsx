import React, { useState, useEffect } from 'react';
import { showNotification } from '../common/Notification';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
  role: string;
  addresses: Address[];
}

interface Address {
  id: number;
  province: string;
  district: string;
  ward: string;
  street: string;
  addressType: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

interface UserStatistics {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersToday: number;
  averageAddressesPerUser: number;
}

interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
  password: string;
  roleNames: string[];
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  
  // Bulk operations
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkModal, setBulkModal] = useState(false);
  
  // Create user form
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: 0,
    password: '',
    roleNames: ['ROLE_USER']
  });

  const API_BASE = 'http://localhost:8070/api';

  // Fetch users with pagination and filters
  const fetchUsers = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        ...(search && { search })
      });

      const response = await fetch(`${API_BASE}/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCurrentPage(page);
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(createUserData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      showNotification('Tạo người dùng thành công!', 'success');
      setShowCreateModal(false);
      setCreateUserData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: 0,
        password: '',
        roleNames: ['ROLE_USER']
      });
      fetchUsers(currentPage, searchTerm);
      fetchStatistics();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi tạo người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (userId: number, userData: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Failed to update user');

      showNotification('Cập nhật người dùng thành công!', 'success');
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      showNotification('Lỗi khi cập nhật người dùng', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      showNotification('Xóa người dùng thành công!', 'success');
      fetchUsers(currentPage, searchTerm);
      fetchStatistics();
    } catch (err) {
      showNotification('Lỗi khi xóa người dùng', 'error');
    }
  };

  // Reset password
  const handleResetPassword = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho người dùng này?')) return;

    try {
      const response = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to reset password');

      const newPassword = await response.text();
      showNotification(
        `Reset mật khẩu thành công! Mật khẩu mới: ${newPassword}`, 
        'success'
      );
    } catch (err) {
      showNotification('Lỗi khi reset mật khẩu', 'error');
    }
  };

  // Bulk operations
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      showNotification('Vui lòng chọn ít nhất một người dùng', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          actionType: action
        })
      });

      if (!response.ok) throw new Error('Bulk action failed');

      const result = await response.text();
      showNotification(result, 'success');
      setSelectedUsers([]);
      setBulkModal(false);
      fetchUsers(currentPage, searchTerm);
      fetchStatistics();
    } catch (err) {
      showNotification('Lỗi khi thực hiện thao tác hàng loạt', 'error');
    }
  };

  // Search and filter
  const handleSearch = () => {
    setCurrentPage(0);
    fetchUsers(0, searchTerm);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm);
  };

  // Select/deselect users
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản và thông tin người dùng</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Tổng người dùng</h3>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Mới hôm nay</h3>
              <p className="text-3xl font-bold text-purple-600">{statistics.newUsersToday}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Mới tháng này</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.newUsersThisMonth}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">TB địa chỉ/người</h3>
              <p className="text-3xl font-bold text-orange-600">{statistics.averageAddressesPerUser.toFixed(1)}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, username, số điện thoại..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tìm kiếm
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Thêm người dùng
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                Đã chọn {selectedUsers.length} người dùng
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('RESET_PASSWORD')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Reset mật khẩu
                </button>
                <button
                  onClick={() => handleBulkAction('DELETE')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ROLE_ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.addresses?.length || 0} địa chỉ
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetail(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-purple-600 hover:text-purple-900 text-sm"
                          >
                            Reset PW
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Hiển thị {currentPage * 10 + 1} đến {Math.min((currentPage + 1) * 10, totalElements)} trong {totalElements} kết quả
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 2 ? i : currentPage - 2 + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Thêm người dùng mới</h2>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={createUserData.username}
                      onChange={(e) => setCreateUserData({...createUserData, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={createUserData.email}
                      onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ
                      </label>
                      <input
                        type="text"
                        required
                        value={createUserData.firstName}
                        onChange={(e) => setCreateUserData({...createUserData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        required
                        value={createUserData.lastName}
                        onChange={(e) => setCreateUserData({...createUserData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="number"
                      required
                      value={createUserData.phoneNumber || ''}
                      onChange={(e) => setCreateUserData({...createUserData, phoneNumber: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      required
                      value={createUserData.password}
                      onChange={(e) => setCreateUserData({...createUserData, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <select
                      value={createUserData.roleNames[0]}
                      onChange={(e) => setCreateUserData({...createUserData, roleNames: [e.target.value]})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ROLE_USER">User</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo người dùng'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Chỉnh sửa người dùng</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  username: formData.get('username') as string,
                  email: formData.get('email') as string,
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  phoneNumber: Number(formData.get('phoneNumber')),
                  role: formData.get('role') as string
                };
                handleUpdateUser(selectedUser.id, userData);
                setShowEditModal(false);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      defaultValue={selectedUser.username}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={selectedUser.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        defaultValue={selectedUser.firstName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        name="lastName"
                        type="text"
                        defaultValue={selectedUser.lastName}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      name="phoneNumber"
                      type="number"
                      defaultValue={selectedUser.phoneNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò
                    </label>
                    <select
                      name="role"
                      defaultValue={selectedUser.role}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ROLE_USER">User</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showUserDetail && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Chi tiết người dùng</h2>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">ID:</span>
                      <p className="font-medium">{selectedUser.id}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Username:</span>
                      <p className="font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Họ tên:</span>
                      <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Số điện thoại:</span>
                      <p className="font-medium">{selectedUser.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Vai trò:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.role === 'ROLE_ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedUser.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">
                    Địa chỉ ({selectedUser.addresses?.length || 0})
                  </h3>
                  {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={address.id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">
                                {address.receiverName} - {address.receiverPhone}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {address.street}, {address.ward}, {address.district}, {address.province}
                              </div>
                              <div className="flex items-center mt-2 space-x-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {address.addressType}
                                </span>
                                {address.isDefault && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có địa chỉ nào</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUserDetail(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleResetPassword(selectedUser.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Reset mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;