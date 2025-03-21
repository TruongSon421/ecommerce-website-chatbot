// src/pages/admin/ProductFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { Product } from '../../types';

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'phone',
    subCategory: '',
    imageUrl: '',
    stock: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      fetchProduct(id);
    }
  }, [id, isEditMode]);

  const fetchProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const product = await productAPI.getById(productId);
      setFormData(product);
      setError(null);
    } catch (err) {
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Xử lý trường hợp đặc biệt cho giá và số lượng
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (isEditMode && id) {
        await productAPI.update(id, formData);
        setSuccessMessage('Cập nhật sản phẩm thành công!');
      } else {
        await productAPI.create(formData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
        setSuccessMessage('Thêm sản phẩm mới thành công!');
        // Reset form sau khi thêm thành công
        if (!isEditMode) {
          setFormData({
            name: '',
            description: '',
            price: 0,
            category: 'phone',
            subCategory: '',
            imageUrl: '',
            stock: 0
          });
        }
      }
      
      // Chuyển về trang danh sách sau 1.5 giây
      setTimeout(() => {
        navigate('/trang-admin-ban-hang/products');
      }, 1500);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error('Error saving product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSubCategoryOptions = () => {
    switch (formData.category) {
      case 'accessory':
        return (
          <>
            <option value="cap">Cáp</option>
            <option value="sac">Sạc</option>
            <option value="hub">Hub chuyển đổi</option>
            <option value="chuot">Chuột</option>
            <option value="banphim">Bàn phím</option>
          </>
        );
      default:
        return null;
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </h1>
        <p className="text-gray-600">
          {isEditMode 
            ? 'Cập nhật thông tin cho sản phẩm hiện có' 
            : 'Điền thông tin để thêm sản phẩm mới vào hệ thống'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                Tên sản phẩm *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                Danh mục *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category || 'phone'}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="phone">Điện thoại</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Máy tính bảng</option>
                <option value="audio">Tai nghe</option>
                <option value="accessory">Phụ kiện</option>
              </select>
            </div>

            {formData.category === 'accessory' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="subCategory">
                  Loại phụ kiện *
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  required={formData.category === 'accessory'}
                  value={formData.subCategory || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn loại phụ kiện</option>
                  {renderSubCategoryOptions()}
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
                Giá (VNĐ) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                required
                value={formData.price || 0}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập giá sản phẩm"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="stock">
                Số lượng tồn kho *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                value={formData.stock || 0}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số lượng tồn kho"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="imageUrl">
                URL Hình ảnh
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={formData.imageUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập URL hình ảnh sản phẩm"
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-32 w-32 object-cover border rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                Mô tả sản phẩm
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mô tả chi tiết về sản phẩm"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/trang-admin-ban-hang/products')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;