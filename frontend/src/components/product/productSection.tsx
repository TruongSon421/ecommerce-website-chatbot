import React from 'react';
import '../../styles/productSection.css';
import ProductCard from './productCard';
import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import useProductApi from '../hooks/useProductApi';

interface Product {
  productId: string;
  variant: string;
  orderNumber: number;
  productName: string;
  defaultOriginalPrice: string | null;
  defaultCurrentPrice: string | null;
  defaultColor?: string | null;
}

interface GroupDto {
  groupId: number;
  orderNumber: number;
  image: string | null;
  type: string;
  groupName?: string;
  brand?: string;
}

interface GroupProduct {
  products: Product[];
  groupDto: GroupDto;
  elasticsearchScore?: number;
}

interface ProductSectionProps {
  title?: string;
  type: string;
  size?: number;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, type, size = 5 }) => {
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const pi = Number(searchParams.get("pi")) || 1; 
  const { products: apiProducts, loading, error, fetchProducts } = useProductApi();
  
  // Function to get the correct URL path based on type
  const getUrlPath = (type: string): string => {
    switch (type) {
      case 'phone':
        return '/phone';
      case 'laptop':
        return '/laptop';
      case 'wireless_earphone':
        return '/audio/wireless_earphone';
      case 'backup_charger':
        return '/phukien/backup_charger';
      default:
        return `/${type}`;
    }
  };
  
  useEffect(() => {
    // Fetch products with the specified type and size
    const queryString = `type=${type}&size=${size}&page=0`;
    fetchProducts(queryString, true);
  }, [type, size, fetchProducts]);

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 20);
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("pi", String(pi + 1));
    setSearchParams(currentParams);
  };

  // Cast apiProducts to the correct type
  const groupProducts: GroupProduct[] = apiProducts as GroupProduct[];
  const remaining: number = groupProducts.length - visibleCount;
  const visibleProducts = groupProducts.slice(0, visibleCount);

  if (loading) {
    return <div className="text-center py-8">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Lỗi: {error}</div>;
  }

  return title ? (
    <section className="product-section">
      <div className="section-header">
        <h2>{title}</h2>
        <a href={getUrlPath(type)} className="view-all">
          Xem tất cả <i className="fas fa-arrow-right"></i>
        </a>
      </div>
      
      <div className="products-grid">
        {groupProducts.map((groupproduct) => (
          <ProductCard 
            key={groupproduct.groupDto.groupId} 
            groupproduct={groupproduct}
          />
        ))}
      </div>
      
    </section>
  ): (
    <section className="mb-12 pl-0 pr-4">
      <div className="grid ml-52 mr-48 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {visibleProducts.map((groupproduct) => (
          <ProductCard 
            key={groupproduct.groupDto.groupId} 
            groupproduct={groupproduct}
          />
        ))}
      </div>
      {visibleCount < groupProducts.length && (
        <div className='flex justify-center '>
          <button className="text-white bg-slate-500 p-5 m-5 hover:bg-slate-300 py-2 px-4 rounded" onClick={handleViewMore}>
          Xem thêm 
          <span className='m-1'>{remaining}</span>
          sản phẩm
        </button>
        </div>
      )}
    </section>
  );
};

export default ProductSection;