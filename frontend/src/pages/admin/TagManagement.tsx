import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../components/hooks/useAuth';
import { useNotification } from '../../components/common/Notification';
import ENV from '../../config/env';

interface Tag {
  tagId: number;
  tagName: string;
  description?: string;
}

interface TagFormData {
  tagName: string;
  description?: string;
}

const TagManagement: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // States
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({ tagName: '', description: '' });
  
  // Delete confirmation
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);

  // Fetch all tags
  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      const response = await fetch(`${ENV.API_URL}/tags/get`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: Tag[] = await response.json();
      setTags(data);
      console.log('Fetched tags:', data);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      setError('Không thể tải danh sách tags. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  // Add new tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tagName.trim()) {
      showNotification('Vui lòng nhập tên tag.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      const params = new URLSearchParams();
      params.append('tagName', formData.tagName.trim());

      const response = await fetch(`${ENV.API_URL}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const newTag: Tag = await response.json();
      console.log('Added tag:', newTag);
      
      // Update local state
      setTags(prev => [...prev, newTag]);
      
      // Reset form
      setFormData({ tagName: '', description: '' });
      setIsAddingTag(false);
      
      showNotification(`Đã thêm tag "${newTag.tagName}" thành công!`, 'success');
    } catch (error: any) {
      console.error('Error adding tag:', error);
      showNotification(error.message || 'Lỗi khi thêm tag', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update tag
  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTag || !formData.tagName.trim()) {
      showNotification('Vui lòng nhập tên tag.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      const params = new URLSearchParams();
      params.append('newTagName', formData.tagName.trim());

      const response = await fetch(`${ENV.API_URL}/tags/${editingTag.tagId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const updatedTag: Tag = await response.json();
      console.log('Updated tag:', updatedTag);
      
      // Update local state
      setTags(prev => prev.map(tag => tag.tagId === updatedTag.tagId ? updatedTag : tag));
      
      // Reset form
      setFormData({ tagName: '', description: '' });
      setEditingTag(null);
      
      showNotification(`Đã cập nhật tag "${updatedTag.tagName}" thành công!`, 'success');
    } catch (error: any) {
      console.error('Error updating tag:', error);
      showNotification(error.message || 'Lỗi khi cập nhật tag', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tag
  const handleDeleteTag = async () => {
    if (!deletingTag) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || user?.token;
      if (!token) {
        showNotification('Không tìm thấy token xác thực.', 'error');
        return;
      }

      const response = await fetch(`${ENV.API_URL}/tags/${deletingTag.tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      // Update local state
      setTags(prev => prev.filter(tag => tag.tagId !== deletingTag.tagId));
      
      showNotification(`Đã xóa tag "${deletingTag.tagName}" thành công!`, 'success');
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      showNotification(error.message || 'Lỗi khi xóa tag', 'error');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setDeletingTag(null);
    }
  };

  // Start editing
  const startEditing = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ tagName: tag.tagName, description: tag.description || '' });
    setIsAddingTag(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTag(null);
    setFormData({ tagName: '', description: '' });
    setIsAddingTag(false);
  };

  // Start adding
  const startAdding = () => {
    setIsAddingTag(true);
    setEditingTag(null);
    setFormData({ tagName: '', description: '' });
  };

  // Confirm delete
  const confirmDelete = (tag: Tag) => {
    setDeletingTag(tag);
    setShowDeleteConfirm(true);
  };

  // Filter tags based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(tag =>
        tag.tagName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTags(filtered);
    }
  }, [tags, searchTerm]);

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Tags</h1>
              <p className="text-gray-600">Quản lý các tags để phân loại sản phẩm</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={startAdding}
                disabled={isAddingTag || editingTag !== null}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isAddingTag || editingTag !== null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                ➕ Thêm Tag Mới
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">🏷️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số Tags</p>
                <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tags Hiển thị</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTags.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <span className="text-2xl">🔍</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang tìm kiếm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchTerm ? 'Có' : 'Không'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAddingTag || editingTag) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTag ? `Chỉnh sửa tag "${editingTag.name}"` : 'Thêm tag mới'}
              </h2>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={editingTag ? handleUpdateTag : handleAddTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tagName}
                  onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên tag..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập mô tả cho tag..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : (editingTag ? 'Cập nhật' : 'Thêm tag')}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm tags
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Danh sách Tags ({filteredTags.length})
              </h2>
              <button
                onClick={fetchTags}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading ? '🔄 Đang tải...' : '🔄 Làm mới'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <span className="text-4xl">❌</span>
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchTags}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Thử lại
                </button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Đang tải danh sách tags...</p>
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <span className="text-4xl">
                    {searchTerm ? '🔍' : '📝'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? `Không tìm thấy tag nào với từ khóa "${searchTerm}"`
                    : 'Chưa có tag nào. Hãy thêm tag đầu tiên!'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={startAdding}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    ➕ Thêm tag đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => (
                  <TagCard
                    key={tag.tagId}
                    tag={tag}
                    onEdit={startEditing}
                    onDelete={confirmDelete}
                    isEditing={editingTag?.tagId === tag.tagId}
                    disabled={isSubmitting || isAddingTag || (editingTag !== null && editingTag.tagId !== tag.tagId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingTag && (
          <DeleteConfirmModal
            tag={deletingTag}
            onConfirm={handleDeleteTag}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeletingTag(null);
            }}
            isDeleting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

// Tag Card Component
interface TagCardProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  isEditing: boolean;
  disabled: boolean;
}

const TagCard: React.FC<TagCardProps> = ({ tag, onEdit, onDelete, isEditing, disabled }) => {
  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isEditing 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{tag.tagName}</h3>
          <p className="text-sm text-gray-500">ID: {tag.tagId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(tag)}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${
              disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-100'
            }`}
            title="Chỉnh sửa tag"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(tag)}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${
              disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-red-600 hover:bg-red-100'
            }`}
            title="Xóa tag"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {tag.description && (
        <p className="text-sm text-gray-600 mb-3">{tag.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Tag #{tag.tagId}</span>
        {isEditing && (
          <span className="text-blue-600 font-medium">Đang chỉnh sửa</span>
        )}
      </div>
    </div>
  );
};

// Delete Confirmation Modal
interface DeleteConfirmModalProps {
  tag: Tag;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  tag,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Xác nhận xóa tag
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bạn có chắc chắn muốn xóa tag <strong>"{tag.tagName}"</strong>?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tag sẽ bị xóa khỏi tất cả sản phẩm đã được gắn tag này.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDeleting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa tag'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManagement;