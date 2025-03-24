// src/components/product/ProductForm.tsx

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProduct } from '../../store/slices/productSlices';
import { ProductCreateRequest, InventoryRequest } from '../../types/product';
import ColorVariantInput from './ColorVariantInput';

interface ProductFormProps {
  onSuccess: (productId: string, productName: string, variant: string, prices: { originalPrice: string | null, currentPrice: string | null }[]) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.product);
  
  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    brand: '',
    category: '',
    images: [''],
    colors: [''],
    variant: '',
    type: 'PHONE',
  });
  
  const [inventories, setInventories] = useState<InventoryRequest[]>([
    { color: null, quantity: 30, originalPrice: null, currentPrice: null }
  ]);
  
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };
  
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newImages = [...productData.images];
    newImages[index] = e.target.value;
    setProductData({ ...productData, images: newImages });
  };
  
  const addImageField = () => {
    setProductData({ ...productData, images: [...productData.images, ''] });
  };
  
  const removeImageField = (index: number) => {
    const newImages = [...productData.images];
    newImages.splice(index, 1);
    setProductData({ ...productData, images: newImages });
  };
  
  const handleColorChange = (colors: string[]) => {
    setProductData({ ...productData, colors });
    
    // Cập nhật inventories để phù hợp với số lượng màu
    if (colors.length > 0) {
      const newInventories = colors.map((color, index) => {
        const existingInventory = inventories[index];
        return {
          color,
          quantity: existingInventory?.quantity || 30,
          originalPrice: existingInventory?.originalPrice || null,
          currentPrice: existingInventory?.currentPrice || null,
        };
      });
      setInventories(newInventories);
    } else {
      // Nếu không có màu, sử dụng một inventory mặc định
      setInventories([{ color: null, quantity: 30, originalPrice: null, currentPrice: null }]);
    }
  };
  
  const handleInventoryChange = (index: number, field: keyof InventoryRequest, value: any) => {
    const newInventories = [...inventories];
    newInventories[index] = { ...newInventories[index], [field]: value };
    setInventories(newInventories);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productRequest: ProductCreateRequest = {
      productRequest: productData,
      inventoryRequests: inventories,
    };
    
    try {
      const actionResult = await dispatch(createProduct(productRequest));
      if (createProduct.fulfilled.match(actionResult)) {
        const productId = actionResult.payload.productId;
        const prices = inventories.map(inv => ({
          originalPrice: inv.originalPrice !== null ? String (inv.originalPrice) : null,
          currentPrice: inv.currentPrice !== null ? String (inv.currentPrice) : null
        }));
        onSuccess(productId, productData.productName, productData.variant, prices);
        
        // Reset form sau khi thành công
        setProductData({
          productName: '',
          description: '',
          brand: '',
          category: '',
          images: [''],
          colors: [''],
          variant: '',
          type: 'PHONE',
        });
        setInventories([{ color: null, quantity: 30, originalPrice: null, currentPrice: null }]);
      }
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
    }
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h4>Thêm sản phẩm mới</h4>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">Tên sản phẩm</label>
            <input
              type="text"
              className="form-control"
              id="productName"
              name="productName"
              value={productData.productName}
              onChange={handleProductChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={productData.description}
              onChange={handleProductChange}
              rows={3}
            ></textarea>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="brand" className="form-label">Thương hiệu</label>
              <input
                type="text"
                className="form-control"
                id="brand"
                name="brand"
                value={productData.brand}
                onChange={handleProductChange}
                required
              />
            </div>
            
            <div className="col-md-6 mb-3">
              <label htmlFor="category" className="form-label">Danh mục</label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={productData.category}
                onChange={handleProductChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="variant" className="form-label">Biến thể</label>
            <input
              type="text"
              className="form-control"
              id="variant"
              name="variant"
              value={productData.variant}
              onChange={handleProductChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="type" className="form-label">Loại</label>
            <select
              className="form-select"
              id="type"
              name="type"
              value={productData.type}
              onChange={handleProductChange}
              required
            >
              <option value="PHONE">Điện thoại</option>
              <option value="LAPTOP">Laptop</option>
              <option value="ACCESSORY">Phụ kiện</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Hình ảnh</label>
            {productData.images.map((image, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="URL hình ảnh"
                  value={image}
                  onChange={(e) => handleImagesChange(e, index)}
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeImageField(index)}
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={addImageField}
            >
              Thêm hình ảnh
            </button>
          </div>
          
          <div className="mb-3">
            <ColorVariantInput
              colors={productData.colors}
              onChange={handleColorChange}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Thông tin kho</label>
            {inventories.map((inventory, index) => (
              <div key={index} className="card mb-3 p-3 bg-light">
                <div className="row align-items-center">
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Màu sắc</label>
                    <input
                      type="text"
                      className="form-control"
                      value={inventory.color || ''}
                      disabled
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Số lượng</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inventory.quantity}
                      onChange={(e) => handleInventoryChange(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Giá gốc</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inventory.originalPrice || ''}
                      onChange={(e) => handleInventoryChange(index, 'originalPrice', e.target.value ? parseInt(e.target.value) : null)}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Giá hiện tại</label>
                    <input
                      type="number"
                      className="form-control"
                      value={inventory.currentPrice || ''}
                      onChange={(e) => handleInventoryChange(index, 'currentPrice', e.target.value ? parseInt(e.target.value) : null)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;