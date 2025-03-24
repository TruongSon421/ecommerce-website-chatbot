// src/pages/AddProductPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/product/ProductForm';
import ProductGroupForm from '../../components/product/ProductGroupForm';

interface ProductInfo {
  productId: string;
  productName: string;
  variant: string;
  prices: { originalPrice: string | null, currentPrice: string | null }[];
}

const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [addedProducts, setAddedProducts] = useState<ProductInfo[]>([]);
  const [formMode, setFormMode] = useState<'single' | 'batch'>('single');
  const [groupSuccess, setGroupSuccess] = useState(false);
  
  const handleProductSuccess = (
    productId: string,
    productName: string,
    variant: string,
    prices: { originalPrice: string | null, currentPrice: string | null }[]
  ) => {
    const productInfo: ProductInfo = {
      productId,
      productName,
      variant,
      prices,
    };
    
    setAddedProducts([...addedProducts, productInfo]);
  };
  
  const handleGroupSuccess = () => {
    setGroupSuccess(true);
    setAddedProducts([]);
    
    // Hiển thị thông báo thành công
    setTimeout(() => {
      setGroupSuccess(false);
    }, 5000);
  };
  
  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = addedProducts.filter(p => p.productId !== productId);
    setAddedProducts(updatedProducts);
  };
  
  const handleResetAll = () => {
    setAddedProducts([]);
    setGroupSuccess(false);
  };
  
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Thêm sản phẩm mới</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/products')}
        >
          Quay lại danh sách
        </button>
      </div>
      
      {groupSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          Tạo nhóm sản phẩm thành công!
          <button type="button" className="btn-close" onClick={() => setGroupSuccess(false)}></button>
        </div>
      )}
      
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${formMode === 'single' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFormMode('single')}
            >
              Thêm từng sản phẩm
            </button>
            <button
              type="button"
              className={`btn ${formMode === 'batch' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFormMode('batch')}
              disabled={true} // Tính năng thêm hàng loạt sẽ được phát triển sau
            >
              Thêm hàng loạt (đang phát triển)
            </button>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-lg-8">
          <ProductForm onSuccess={handleProductSuccess} />
        </div>
        
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sản phẩm đã thêm ({addedProducts.length})</h5>
              {addedProducts.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleResetAll}
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="card-body">
              {addedProducts.length > 0 ? (
                <ul className="list-group">
                  {addedProducts.map((product) => (
                    <li key={product.productId} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{product.productName}</strong>
                        <br />
                        <small>ID: {product.productId} | Biến thể: {product.variant}</small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveProduct(product.productId)}
                      >
                        Xóa
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-center py-3">Chưa có sản phẩm nào được thêm</p>
              )}
            </div>
          </div>
          
          {addedProducts.length > 0 && (
            <ProductGroupForm
              products={addedProducts}
              onSuccess={handleGroupSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;