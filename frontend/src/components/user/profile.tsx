import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { showNotification } from '../common/Notification';
import { getProfile, updateProfile } from '../../services/authService';
import { User } from '../../types/auth';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user?.id) {
        setError('Vui lòng đăng nhập để xem thông tin tài khoản.');
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getProfile();
        setProfile(userProfile);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
        showNotification('Lỗi khi tải thông tin tài khoản', 'error');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user?.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await updateProfile({
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      });
      showNotification('Cập nhật thông tin thành công!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showNotification('Lỗi khi cập nhật thông tin', 'error');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Đang tải thông tin...</div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center p-4 text-red-500">
        {error || 'Không có thông tin tài khoản.'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thông tin tài khoản</h1>
      <form onSubmit={handleUpdateProfile} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-gray-700">Tên người dùng</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Số điện thoại</label>
          <input
            type="text"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Địa chỉ</label>
          <input
            type="text"
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Cập nhật
        </button>
      </form>
    </div>
  );
};

export default Profile;