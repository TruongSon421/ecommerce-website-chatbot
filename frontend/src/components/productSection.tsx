import React from 'react';
import '../styles/productSection.css';
import ProductCard from './productCard';
import { useState } from 'react';
import { useSearchParams } from "react-router-dom";

interface imagesUrl {
  url : string;
  title?: string;
};

interface Product {
  id: number;
  name: string;
  price: number;
  current_prices: string[];
  old_prices: string;
  images: imagesUrl[];
  imageSrc: string;
  discount: number;
  isNew: boolean;
}

interface ProductSectionProps {
  title?: string;
  products: Product[];
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products }) => {
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [searchParams, setSearchParams] = useSearchParams();
  const pi = Number(searchParams.get("pi")) || 1; 
  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 20);
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set("pi", String(pi + 1));
    setSearchParams(currentParams);
  };
  const remaining:number = products.length - visibleCount;
  const visibleProducts = products.slice(0, visibleCount);
  return title ? (
    <section className="product-section">
      <div className="section-header">
        <h2>{title}</h2>
        <a href={`/${title.toLowerCase()}`} className="view-all">
          Xem tất cả <i className="fas fa-arrow-right"></i>
        </a>
      </div>
      
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
    </section>
  ): (
    <section className="mb-12 pl-0 pr-4">
      <div className="grid ml-52 mr-48 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
      {visibleCount < products.length && (
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