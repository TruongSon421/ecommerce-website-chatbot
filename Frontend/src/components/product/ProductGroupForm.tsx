// src/components/product/ProductGroupForm.tsx

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createGroupVariant } from '../../store/slices/productSlices';
import { GroupVariantRequest } from '../../types/product';

interface ProductGroupFormProps {
  products: {
    productId: string;
    productName: string;
    variant: string;
    prices: { originalPrice: string | null, currentPrice: string | null }[];
  }[];
  onSuccess: () => void;
}

const ProductGroupForm: React.FC<ProductGroupFormProps> = ({ products, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.product);
  
  const [groupData, setGroupData] = useState<GroupVariantRequest>({
    productIds: [],
    image: null,
    type: 'PHONE',
    variants: [],
    productNames: [],
    defaultOriginalPrices: [],
    defaultCurrentPrices: [],
  });
  
  const [groupImage, setGroupImage] = useState('');
  
  useEffect(() => {
    if (products.length > 0) {
      const productIds = products.map(p => p.productId);
      const variants = products.map(p => p.variant);
      const productNames = products.map(p => p.productName);
      const defaultOriginalPrices = products.map(p => p.prices[0]?.originalPrice || null);
      const defaultCurrentPrices = products.map(p => p.prices[0]?.currentPrice || null);
      
      setGroupData({
        productIds,
        image: null,
        type: 'PHONE',
        variants,
        productNames,
        defaultOriginalPrices,
        defaultCurrentPrices,
      });
    }
  }, [products]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupImage(e.target.value);
    setGroupData({ ...groupData, image: e.target.value || null });
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupData({ ...groupData, type: e.target.value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const actionResult = await dispatch(createGroupVariant(groupData));
      if (createGroupVariant.fulfilled.match(actionResult)) {
        onSuccess();
        setGroupImage('');
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhóm sản phẩm:', error);
    }
  };
  
  return (
    <div className="card mt-4">
      <div className="card-header">
        <h4>Tạo nhóm sản phẩm</h4>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="groupImage" className="form-label">Hình ảnh nhóm</label>
            <input
              type="text"
              className="form-control"
              id="groupImage"
              value={groupImage}
              onChange={handleImageChange}
              placeholder="URL hình ảnh đại diện cho nhóm"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Sản phẩm trong nhóm</label>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>Biến thể</th>
                    <th>Giá gốc mặc định</th>
                    <th>Giá hiện tại mặc định</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={product.productId}>
                        <td>{product.productId}</td>
                        <td>{product.productName}</td>
                        <td>{product.variant}</td>
                        <td>{product.prices[0]?.originalPrice || 'N/A'}</td>
                        <td>{product.prices[0]?.currentPrice || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">Chưa có sản phẩm được thêm</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || products.length === 0}
            >
              {loading ? 'Đang xử lý...' : 'Tạo nhóm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductGroupForm;