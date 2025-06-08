import React, { useState, useEffect } from 'react';
import { User, CreateUserData } from '../services/userService';

interface UserFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user?: User | null;
  onClose: () => void;
  onSubmit: (data: CreateUserData | Partial<User>) => void;
  loading?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  mode,
  user,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: 0,
    password: '',
    roleNames: ['ROLE_USER']
  });

  const [editData, setEditData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: 0,
    role: 'ROLE_USER'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: 0,
          password: '',
          roleNames: ['ROLE_USER']
        });
      } else if (mode === 'edit' && user) {
        setEditData({
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'create') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username là bắt buộc';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username phải có ít nhất 3 ký tự';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Họ là bắt buộc';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Tên là bắt buộc';
      }

      if (!formData.phoneNumber || formData.phoneNumber < 1000000000) {
        newErrors.phoneNumber = 'Số điện thoại phải có ít nhất 10 chữ số';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    } else {
      if (!editData.username.trim()) {
        newErrors.username = 'Username là bắt buộc';
      }

      if (!editData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      if (!editData.firstName.trim()) {
        newErrors.firstName = 'Họ là bắt buộc';
      }

      if (!editData.lastName.trim()) {
        newErrors.lastName = 'Tên là bắt buộc';
      }

      if (!editData.phoneNumber || editData.phoneNumber < 1000000000) {
        newErrors.phoneNumber = 'Số điện thoại phải có ít nhất 10 chữ số';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      onSubmit(formData);
    } else {
      onSubmit(editData);
    }
  };

  const handleCreateFormChange = (field: keyof CreateUserData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEditFormChange = (field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {mode === 'create' ? '➕ Thêm người dùng mới' : '✏️ Chỉnh sửa người dùng'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mode === 'create' ? formData.username : editData.username}
                    onChange={(e) => 
                      mode === 'create' 
                        ? handleCreateFormChange('username', e.target.value)
                        : handleEditFormChange('username', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={mode === 'create' ? formData.email : editData.email}
                    onChange={(e) => 
                      mode === 'create' 
                        ? handleCreateFormChange('email', e.target.value)
                        : handleEditFormChange('email', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mode === 'create' ? formData.firstName : editData.firstName}
                    onChange={(e) => 
                      mode === 'create' 
                        ? handleCreateFormChange('firstName', e.target.value)
                        : handleEditFormChange('firstName', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mode === 'create' ? formData.lastName : editData.lastName}
                    onChange={(e) => 
                      mode === 'create' 
                        ? handleCreateFormChange('lastName', e.target.value)
                        : handleEditFormChange('lastName', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={mode === 'create' ? formData.phoneNumber || '' : editData.phoneNumber || ''}
                    onChange={(e) => 
                      mode === 'create' 
                        ? handleCreateFormChange('phoneNumber', Number(e.target.value))
                        : handleEditFormChange('phoneNumber', Number(e.target.value))
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mode === 'create' ? formData.roleNames[0] : editData.role}
                    onChange={(e) => 
                      mode === 'create' 
                        ? handleCreateFormChange('roleNames', [e.target.value])
                        : handleEditFormChange('role', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ROLE_USER">👤 User (Người dùng)</option>
                    <option value="ROLE_ADMIN">👑 Admin (Quản trị viên)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Password Section (Create mode only) */}
            {mode === 'create' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bảo mật</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleCreateFormChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mật khẩu phải có ít nhất 6 ký tự và nên bao gồm chữ, số và ký tự đặc biệt
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading 
                  ? (mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...') 
                  : (mode === 'create' ? '➕ Tạo người dùng' : '💾 Cập nhật')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;