import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../../services/userService';
import { getProvinces, getDistricts, getWards } from '../../services/addressService';
import { User, Address } from '../../types/auth';
import { Province, District, Ward } from '../../types/cart';

const Profile: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [newAddress, setNewAddress] = useState<Address>({
    province: '',
    district: '',
    ward: '',
    street: '',
    addressType: '',
    receiverName: '',
    receiverPhone: '',
    isDefault: false,
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addressTypeOptions = [
    { value: 'NHA_RIENG', label: 'Nhà riêng' },
    { value: 'VAN_PHONG', label: 'Văn phòng' },
  ];

  // Clear error and success messages after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (err) {
        setError('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    fetchProvinces();
  }, []);

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated || !user?.id) {
        setError('Vui lòng đăng nhập để xem hồ sơ');
        return;
      }
      setIsLoading(true);
      try {
        console.log('Fetching user with ID:', user.id);
        const userData = await userService.getUserDetails(user.id);
        console.log('User data fetched:', userData);
        setProfileUser(userData);
        setUserForm({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
        });
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.response?.data?.message || 'Không thể tải dữ liệu người dùng');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [user, isAuthenticated]);

  // Fetch districts when province changes
  const fetchDistricts = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    try {
      const data = await getDistricts(Number(provinceCode));
      setDistricts(data);
      setWards([]); // Reset wards when province changes
    } catch (err) {
      setError('Không thể tải danh sách quận/huyện');
    }
  }, []);

  // Fetch wards when district changes
  const fetchWards = useCallback(async (districtCode: string) => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    try {
      const data = await getWards(Number(districtCode));
      setWards(data);
    } catch (err) {
      setError('Không thể tải danh sách phường/xã');
    }
  }, []);

  // Handle province change
  useEffect(() => {
    const province = editingAddress ? editingAddress.province : newAddress.province;
    if (province) {
      fetchDistricts(province);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [newAddress.province, editingAddress?.province, fetchDistricts]);

  // Handle district change
  useEffect(() => {
    const district = editingAddress ? editingAddress.district : newAddress.district;
    if (district) {
      fetchWards(district);
    } else {
      setWards([]);
    }
  }, [newAddress.district, editingAddress?.district, fetchWards]);

  // ✅ Address form validation
  const validateAddressForm = () => {
    const currentAddress = editingAddress || newAddress;
    
    // Check province selection
    if (!currentAddress.province) {
      setError('Vui lòng chọn Tỉnh/Thành phố');
      return false;
    }
    
    // Check district selection
    if (!currentAddress.district) {
      setError('Vui lòng chọn Quận/Huyện');
      return false;
    }
    
    // Check ward selection
    if (!currentAddress.ward) {
      setError('Vui lòng chọn Phường/Xã');
      return false;
    }
    
    // Check street address
    if (!currentAddress.street || currentAddress.street.trim().length < 5) {
      setError('Vui lòng nhập địa chỉ chi tiết (ít nhất 5 ký tự)');
      return false;
    }
    
    // Check receiver name
    if (!currentAddress.receiverName || currentAddress.receiverName.trim().length < 2) {
      setError('Vui lòng nhập tên người nhận (ít nhất 2 ký tự)');
      return false;
    }
    
    // Check receiver phone
    if (!currentAddress.receiverPhone) {
      setError('Vui lòng nhập số điện thoại người nhận');
      return false;
    }
    
    if (!/^[0-9]{10,14}$/.test(currentAddress.receiverPhone)) {
      setError('Số điện thoại không hợp lệ (phải có 10-14 chữ số)');
      return false;
    }
    
    return true;
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    // ✅ Validate phone number format before sending
    if (userForm.phoneNumber) {
      const phoneStr = userForm.phoneNumber.toString().trim();
      if (!/^[0-9]{10,14}$/.test(phoneStr)) {
        setError('Số điện thoại phải có từ 10-14 chữ số và chỉ chứa số');
        return;
      }
    }
    
    setIsLoading(true);
    try {
      console.log('Sending update data:', userForm);
      
      const updatedUser = await userService.updateUser(user.id, userForm);
      setProfileUser(updatedUser);
      setIsEditingUser(false);
      setSuccess('Cập nhật thông tin cá nhân thành công');
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Cập nhật thông tin cá nhân thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Phone number handler with validation
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const numericValue = value.replace(/[^0-9]/g, '');
    setUserForm({ ...userForm, phoneNumber: numericValue });
  };

  // ✅ Address phone handler with validation
  const handleAddressPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (editingAddress) {
      setEditingAddress(prev => prev ? { ...prev, receiverPhone: numericValue } : null);
    } else {
      setNewAddress(prev => ({ ...prev, receiverPhone: numericValue }));
    }
  };

  // ✅ Receiver name handler with validation
  const handleReceiverNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, spaces, and Vietnamese characters
    const validName = value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
    
    if (editingAddress) {
      setEditingAddress(prev => prev ? { ...prev, receiverName: validName } : null);
    } else {
      setNewAddress(prev => ({ ...prev, receiverName: validName }));
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    // Validate form before submitting
    if (!validateAddressForm()) return;
    
    setIsLoading(true);
    try {
      const provinceName = provinces.find((p) => p.code === Number(newAddress.province))?.name || '';
      const districtName = districts.find((d) => d.code === Number(newAddress.district))?.name || '';
      const wardName = wards.find((w) => w.code === Number(newAddress.ward))?.name || '';
      
      // ✅ Handle first address logic
      const isFirstAddress = !profileUser?.addresses || profileUser.addresses.length === 0;
      
      const addressPayload = {
        ...newAddress,
        province: provinceName,
        district: districtName,
        ward: wardName,
        receiverName: newAddress.receiverName.trim(),
        receiverPhone: newAddress.receiverPhone.trim(),
        // ✅ First address is always default, others respect checkbox
        isDefault: isFirstAddress ? true : newAddress.isDefault,
      };
      
      console.log('Adding address:', addressPayload);
      
      const addedAddress = await userService.addAddress(user.id, addressPayload);
      
      // ✅ Update state properly
      setProfileUser((prev) => {
        if (!prev) return null;
        
        // If this is set as default, update other addresses to not be default
        const updatedAddresses = addedAddress.isDefault 
          ? prev.addresses.map(addr => ({ ...addr, isDefault: false }))
          : prev.addresses;
          
        return {
          ...prev,
          addresses: [...updatedAddresses, addedAddress]
        };
      });
      
      // Reset form
      setNewAddress({
        province: '',
        district: '',
        ward: '',
        street: '',
        addressType: '',
        receiverName: '',
        receiverPhone: '',
        isDefault: false,
      });
      setDistricts([]);
      setWards([]);
      setSuccess('Thêm địa chỉ thành công');
    } catch (err: any) {
      console.error('Add address error:', err);
      setError(err.response?.data?.message || 'Thêm địa chỉ thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingAddress?.id) return;
    
    // Validate form before submitting
    if (!validateAddressForm()) return;
    
    setIsLoading(true);
    try {
      const provinceName = provinces.find((p) => p.code === Number(editingAddress.province))?.name || '';
      const districtName = districts.find((d) => d.code === Number(editingAddress.district))?.name || '';
      const wardName = wards.find((w) => w.code === Number(editingAddress.ward))?.name || '';
      
      const addressPayload = {
        ...editingAddress,
        province: provinceName,
        district: districtName,
        ward: wardName,
        receiverName: editingAddress.receiverName.trim(),
        receiverPhone: editingAddress.receiverPhone.trim(),
      };
      
      console.log('Updating address:', addressPayload);
      
      const updatedAddress = await userService.updateAddress(user.id, editingAddress.id, addressPayload);
      
      // ✅ Update state properly with default logic
      setProfileUser((prev) => {
        if (!prev) return null;
        
        const updatedAddresses = prev.addresses.map((addr) => {
          if (addr.id === updatedAddress.id) {
            return updatedAddress;
          }
          // If updated address is set as default, others should not be default
          if (updatedAddress.isDefault && addr.id !== updatedAddress.id) {
            return { ...addr, isDefault: false };
          }
          return addr;
        });
        
        return {
          ...prev,
          addresses: updatedAddresses
        };
      });
      
      setEditingAddress(null);
      setDistricts([]);
      setWards([]);
      setSuccess('Cập nhật địa chỉ thành công');
    } catch (err: any) {
      console.error('Update address error:', err);
      setError(err.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!user?.id) return;
    
    // ✅ Prevent deleting if it's the only address and user wants to keep at least one
    const addressToDelete = profileUser?.addresses.find(addr => addr.id === addressId);
    const isOnlyAddress = profileUser?.addresses.length === 1;
    
    if (isOnlyAddress) {
      const confirmDelete = window.confirm(
        'Đây là địa chỉ duy nhất của bạn. Bạn có chắc muốn xóa không?'
      );
      if (!confirmDelete) return;
    } else if (addressToDelete?.isDefault) {
      const confirmDelete = window.confirm(
        'Đây là địa chỉ mặc định. Nếu xóa, địa chỉ gần nhất sẽ được đặt làm mặc định. Bạn có chắc muốn xóa không?'
      );
      if (!confirmDelete) return;
    }
    
    setIsLoading(true);
    try {
      await userService.deleteAddress(user.id, addressId);
      
      // ✅ Update state and handle default logic on frontend
      setProfileUser((prev) => {
        if (!prev) return null;
        
        const remainingAddresses = prev.addresses.filter((addr) => addr.id !== addressId);
        
        // If deleted address was default and there are remaining addresses,
        // the backend will handle setting new default, but we can optimistically update UI
        if (addressToDelete?.isDefault && remainingAddresses.length > 0) {
          // The most recent address (first in array) should become default
          const updatedAddresses = remainingAddresses.map((addr, index) => 
            index === 0 ? { ...addr, isDefault: true } : addr
          );
          return { ...prev, addresses: updatedAddresses };
        }
        
        return { ...prev, addresses: remainingAddresses };
      });
      
      setSuccess('Xóa địa chỉ thành công');
    } catch (err: any) {
      console.error('Delete address error:', err);
      setError(err.response?.data?.message || 'Không thể xóa địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingAddress = async (address: Address) => {
    // Find province code
    const provinceCode = provinces.find((p) => p.name === address.province)?.code.toString() || '';
    if (!provinceCode) {
      setError('Không tìm thấy mã tỉnh/thành phố cho địa chỉ này');
      return;
    }

    // Reset districts and wards to avoid stale data
    setDistricts([]);
    setWards([]);

    // Fetch districts for the province
    let fetchedDistricts: District[] = [];
    try {
      fetchedDistricts = await getDistricts(Number(provinceCode));
      setDistricts(fetchedDistricts);
    } catch (err) {
      setError('Không thể tải danh sách quận/huyện');
      return;
    }

    // Find district code using fetched districts
    const districtCode = fetchedDistricts.find((d) => d.name === address.district)?.code.toString() || '';
    if (!districtCode) {
      setError('Không tìm thấy mã quận/huyện cho địa chỉ này');
      return;
    }

    // Fetch wards for the district
    let fetchedWards: Ward[] = [];
    try {
      fetchedWards = await getWards(Number(districtCode));
      setWards(fetchedWards);
    } catch (err) {
      setError('Không thể tải danh sách phường/xã');
      return;
    }

    // Find ward code using fetched wards
    const wardCode = fetchedWards.find((w) => w.name === address.ward)?.code.toString() || '';
    if (!wardCode) {
      setError('Không tìm thấy mã phường/xã cho địa chỉ này');
      return;
    }

    // Set editingAddress with all codes
    setEditingAddress({
      ...address,
      province: provinceCode,
      district: districtCode,
      ward: wardCode,
    });
  };

  const handleAddressInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editingAddress) {
      setEditingAddress((prev) => (prev ? { ...prev, [name]: value } : null));
      if (name === 'province') {
        setDistricts([]);
        setWards([]);
      } else if (name === 'district') {
        setWards([]);
      }
    } else {
      setNewAddress((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'province' ? { district: '', ward: '' } : {}),
        ...(name === 'district' ? { ward: '' } : {}),
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    if (editingAddress) {
      setEditingAddress((prev) => (prev ? { ...prev, isDefault: checked } : null));
    } else {
      setNewAddress((prev) => ({ ...prev, isDefault: checked }));
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Hồ Sơ Người Dùng</h1>

      {(authLoading || isLoading) && (
        <div className="text-center mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <span className="mr-2">✅</span>
          {success}
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      {!authLoading && !isLoading && !profileUser && !error && (
        <div className="text-center mb-4 text-gray-500">Không có dữ liệu người dùng</div>
      )}

      {profileUser && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông Tin Cá Nhân</h2>
            {isEditingUser ? (
              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={profileUser.username}
                    disabled
                    className="w-full p-2 border rounded bg-gray-100 text-gray-500"
                  />
                  <small className="text-gray-500">Không thể thay đổi tên đăng nhập</small>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={userForm.email || ''}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên</label>
                  <input
                    type="text"
                    value={userForm.firstName || ''}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ</label>
                  <input
                    type="text"
                    value={userForm.lastName || ''}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="text"
                    value={userForm.phoneNumber || ''}
                    onChange={handlePhoneNumberChange}
                    placeholder="0919473047"
                    maxLength={14}
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                    disabled={isLoading}
                  />
                  <small className="text-gray-500">Nhập 10-14 chữ số</small>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingUser(false);
                      setError(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p><strong>Tên đăng nhập:</strong> {profileUser.username}</p>
                <p><strong>Email:</strong> {profileUser.email}</p>
                <p><strong>Tên:</strong> {profileUser.firstName || '-'}</p>
                <p><strong>Họ:</strong> {profileUser.lastName || '-'}</p>
                <p><strong>Số điện thoại:</strong> {profileUser.phoneNumber || '-'}</p>
                <button
                  onClick={() => setIsEditingUser(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
                  disabled={isLoading}
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Địa Chỉ</h2>
            {profileUser.addresses?.length === 0 ? (
              <p className="text-gray-500">Không có địa chỉ nào.</p>
            ) : (
              <div className="space-y-4">
                {profileUser.addresses?.map((address) => (
                  <div key={address.id} className="border p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p><strong>Tỉnh/Thành phố:</strong> {address.province}</p>
                        <p><strong>Quận/Huyện:</strong> {address.district}</p>
                        <p><strong>Phường/Xã:</strong> {address.ward}</p>
                        <p><strong>Đường:</strong> {address.street}</p>
                        <p><strong>Loại địa chỉ:</strong> {address.addressType || '-'}</p>
                        <p><strong>Tên người nhận:</strong> {address.receiverName}</p>
                        <p><strong>Số điện thoại người nhận:</strong> {address.receiverPhone}</p>
                        <div className="flex items-center mt-2">
                          <strong>Mặc định:</strong>
                          {address.isDefault ? (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              ✓ Mặc định
                            </span>
                          ) : (
                            <span className="ml-2 text-gray-500 text-sm">Không</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => startEditingAddress(address)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                          disabled={isLoading}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id!)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          disabled={isLoading}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
            </h2>
            
        
            <form 
              onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} 
              className="space-y-4"
              noValidate
            >
              {/* Province Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={editingAddress ? editingAddress.province : newAddress.province}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  required
                  disabled={isLoading}
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={editingAddress ? editingAddress.district : newAddress.district}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  required
                  disabled={isLoading || !((editingAddress ? editingAddress.province : newAddress.province))}
                >
                  <option value="">
                    -- Chọn quận/huyện --
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ward Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phường/Xã <span className="text-red-500">*</span>
                </label>
                <select
                  name="ward"
                  value={editingAddress ? editingAddress.ward : newAddress.ward}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  required
                  disabled={isLoading || !((editingAddress ? editingAddress.district : newAddress.district))}
                >
                  <option value="">
                    -- Chọn phường/xã --
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Đường/Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={editingAddress ? editingAddress.street : newAddress.street}
                  onChange={handleAddressInputChange}
                  placeholder="123 Nguyễn Huệ"
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  required
                  disabled={isLoading}
                />
                <small className="text-gray-500">Ít nhất 5 ký tự</small>
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại địa chỉ</label>
                <select
                  name="addressType"
                  value={editingAddress ? editingAddress.addressType : newAddress.addressType}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  disabled={isLoading}
                >
                  <option value="">-- Chọn loại địa chỉ --</option>
                  {addressTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Receiver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={editingAddress ? editingAddress.receiverName : newAddress.receiverName}
                  onChange={handleReceiverNameChange}
                  placeholder="Nguyễn Văn A"
                  maxLength={100}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  required
                  disabled={isLoading}
                />
                <small className="text-gray-500">
                  Chỉ chứa chữ cái và khoảng trắng, tối đa 100 ký tự
                </small>
              </div>

              {/* Receiver Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="receiverPhone"
                  value={editingAddress ? editingAddress.receiverPhone : newAddress.receiverPhone}
                  onChange={handleAddressPhoneChange}
                  placeholder="0919473047"
                  maxLength={14}
                  className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
                  required
                  disabled={isLoading}
                />
                <small className="text-gray-500">Nhập 10-14 chữ số</small>
              </div>

              {/* Default Checkbox */}
              {(() => {
                const isFirstAddress = !profileUser?.addresses || profileUser.addresses.length === 0;
                const isEditingAndMultiple = editingAddress && profileUser?.addresses.length > 1;
                const isAddingAndNotFirst = !editingAddress && !isFirstAddress;
                
                // Show checkbox only when:
                // 1. Adding new address and there are existing addresses, OR
                // 2. Editing an address and there are multiple addresses
                const shouldShowCheckbox = isAddingAndNotFirst || isEditingAndMultiple;
                
                if (!shouldShowCheckbox) {
                  return null;
                }
                
                return (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={editingAddress ? editingAddress.isDefault : newAddress.isDefault}
                      onChange={handleCheckboxChange}
                      disabled={isLoading}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>
                );
              })()}

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (editingAddress ? 'Đang cập nhật...' : 'Đang thêm...') 
                    : (editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ')
                  }
                </button>
                {editingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setDistricts([]);
                      setWards([]);
                      setError(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;