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
    isDefault: true,
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addressTypeOptions = [
    { value: 'Nhà riêng', label: 'Nhà riêng' },
    { value: 'Văn phòng', label: 'Văn phòng' },
  ];

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

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(user.id, userForm);
      setProfileUser(updatedUser);
      setIsEditingUser(false);
      setSuccess('Cập nhật thông tin cá nhân thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật thông tin cá nhân thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const provinceName = provinces.find((p) => p.code === Number(newAddress.province))?.name || '';
      const districtName = districts.find((d) => d.code === Number(newAddress.district))?.name || '';
      const wardName = wards.find((w) => w.code === Number(newAddress.ward))?.name || '';
      const addressPayload = {
        ...newAddress,
        province: provinceName,
        district: districtName,
        ward: wardName,
        isDefault: profileUser?.addresses.length === 0 ? true : newAddress.isDefault,
      };
      const addedAddress = await userService.addAddress(user.id, addressPayload);
      setProfileUser((prev) =>
        prev ? { ...prev, addresses: [...prev.addresses, addedAddress] } : null
      );
      setNewAddress({
        province: '',
        district: '',
        ward: '',
        street: '',
        addressType: '',
        receiverName: '',
        receiverPhone: '',
        isDefault: true,
      });
      setDistricts([]);
      setWards([]);
      setSuccess('Thêm địa chỉ thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thêm địa chỉ thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingAddress?.id) return;
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
      };
      const updatedAddress = await userService.updateAddress(user.id, editingAddress.id, addressPayload);
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              addresses: prev.addresses.map((addr) =>
                addr.id === updatedAddress.id ? updatedAddress : addr
              ),
            }
          : null
      );
      setEditingAddress(null);
      setDistricts([]);
      setWards([]);
      setSuccess('Cập nhật địa chỉ thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await userService.deleteAddress(user.id, addressId);
      setProfileUser((prev) =>
        prev ? { ...prev, addresses: prev.addresses.filter((addr) => addr.id !== addressId) } : null
      );
      setSuccess('Xóa địa chỉ thành công');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa địa chỉ mặc định duy nhất');
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

      {(authLoading || isLoading) && <div className="text-center mb-4">Đang tải...</div>}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>}

      {!authLoading && !isLoading && !profileUser && !error && (
        <div className="text-center mb-4">Không có dữ liệu người dùng</div>
      )}

      {profileUser && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông Tin Cá Nhân</h2>
            {isEditingUser ? (
              <form onSubmit={handleUserUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={profileUser.username}
                    disabled
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={userForm.email || ''}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tên</label>
                  <input
                    type="text"
                    value={userForm.firstName || ''}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Họ</label>
                  <input
                    type="text"
                    value={userForm.lastName || ''}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số điện thoại</label>
                  <input
                    type="text"
                    value={userForm.phoneNumber || ''}
                    onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUser(false)}
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
            {profileUser.addresses.length === 0 ? (
              <p>Không có địa chỉ nào.</p>
            ) : (
              <div className="space-y-4">
                {profileUser.addresses.map((address) => (
                  <div key={address.id} className="border p-4 rounded">
                    <p><strong>Tỉnh/Thành phố:</strong> {address.province}</p>
                    <p><strong>Quận/Huyện:</strong> {address.district}</p>
                    <p><strong>Phường/Xã:</strong> {address.ward}</p>
                    <p><strong>Đường:</strong> {address.street}</p>
                    <p><strong>Loại địa chỉ:</strong> {address.addressType || '-'}</p>
                    <p><strong>Tên người nhận:</strong> {address.receiverName}</p>
                    <p><strong>Số điện thoại người nhận:</strong> {address.receiverPhone}</p>
                    <p><strong>Mặc định:</strong> {address.isDefault ? 'Có' : 'Không'}</p>
                    <div className="flex space-x-4 mt-2">
                      <button
                        onClick={() => startEditingAddress(address)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        disabled={isLoading}
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id!)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        disabled={isLoading}
                      >
                        Xóa
                      </button>
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
            <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Tỉnh/Thành phố</label>
                <select
                  name="province"
                  value={editingAddress ? editingAddress.province : newAddress.province}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Quận/Huyện</label>
                <select
                  name="district"
                  value={editingAddress ? editingAddress.district : newAddress.district}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading || !((editingAddress ? editingAddress.province : newAddress.province))}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Phường/Xã</label>
                <select
                  name="ward"
                  value={editingAddress ? editingAddress.ward : newAddress.ward}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading || !((editingAddress ? editingAddress.district : newAddress.district))}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Đường/Địa chỉ chi tiết</label>
                <input
                  type="text"
                  name="street"
                  value={editingAddress ? editingAddress.street : newAddress.street}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Loại địa chỉ</label>
                <select
                  name="addressType"
                  value={editingAddress ? editingAddress.addressType : newAddress.addressType}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
                >
                  <option value="">Chọn loại địa chỉ</option>
                  {addressTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Tên người nhận</label>
                <input
                  type="text"
                  name="receiverName"
                  value={editingAddress ? editingAddress.receiverName : newAddress.receiverName}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Số điện thoại người nhận</label>
                <input
                  type="text"
                  name="receiverPhone"
                  value={editingAddress ? editingAddress.receiverPhone : newAddress.receiverPhone}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              {/* Show checkbox only when:
                  - Adding a new address and there are existing addresses, or
                  - Editing an address and there are multiple addresses */}
              {((!editingAddress && profileUser?.addresses.length > 0) ||
                (editingAddress && profileUser?.addresses.length > 1)) && (
                <div>
                  <label className="block text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={editingAddress ? editingAddress.isDefault : newAddress.isDefault}
                      onChange={handleCheckboxChange}
                      disabled={isLoading}
                    />
                    Đặt làm mặc định
                  </label>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {editingAddress ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                </button>
                {editingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setDistricts([]);
                      setWards([]);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-blue-300"
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
