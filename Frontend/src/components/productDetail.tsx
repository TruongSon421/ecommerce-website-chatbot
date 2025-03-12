import React, { useState } from 'react';
import BannerSection from './bannerSection';
import ProductReview from './productReview';
import ProductSpecifications from './productSpecifications';

// Định nghĩa interface cho props của sản phẩm
interface Image {
  url: string;
  title: string;
}

interface ProductReview {
  title: string;
  content: string;
}

interface Specification {
  name: string;
  value: string | string[];
}

interface Product {
  productId: string;
  productName: string;
  description?: string;
  isNew?: boolean;
  brand: string;
  images: Record<string, Image[]>;
  type: string;
  warrantyPeriod?: null;
  productReviews: ProductReview[];
  promotions: string[];
  release: string;
  original_prices: string[];
  current_prices: string[];
  specifications: Specification[];
  colors: string[];
  quantities: number[];
  variants: string[];
  productNames: string[];
}


// Component chính: ProductDetail
const ProductDetail: React.FC<{product: Product}> = ({ product }) => {
  const [selectedStorage, setSelectedStorage] = useState(product.variants[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  return (
    <>
    <div className="bg-[#333] text-white p-8 ml-24 mr-24">
      <div className="flex flex-col md:flex-row">
        {/* Bên trái: Bộ sưu tập hình ảnh */}

        <ProductImageGallery thumbnails={product.images[selectedColor]} />
        
        {/* Bên phải: Chi tiết sản phẩm */}
        <div className="md:ml-8 w-full md:w-1/2">
          <ProductHeader
            title={product.productName}
            isNew={product.isNew}
          />
          <ProductPrice current_prices={product.current_prices[0]} />
          {/* <ProductOptions
            storageOptions={product.colors}
            selectedStorage={selectedStorage}
            onStorageChange={setSelectedStorage}
            colorOptions={product.colors}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          /> */}
          <BannerSection imageSrc='/images/slider/slide1.png' altText='banner-pd-dt'/>
          <Promotions promotions={product.promotions} />
          <ActionButtons />
        </div>
      </div>
    </div>
    <div className='bg-white'>
        <ProductSpecifications specifications={product.specifications} />
        <ProductReview />
    </div>
    </>
  );
};

// Component hiển thị tiêu đề sản phẩm
interface ProductHeaderProps {
  title: string;
  isNew?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ title, isNew }) => (
  <div>
    <h1 className="text-3xl font-bold text-white">
      {title}
      {isNew && <span className="ml-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">Mới</span>}
    </h1>
  </div>
);

// Component hiển thị giá sản phẩm
interface ProductPriceProps {
  //original_prices: string;
  current_prices: string;
}


const ProductPrice: React.FC<ProductPriceProps> = ({ current_prices}) => (
  <div className="mt-4">
    <span className="text-4xl font-bold">{current_prices}</span>
  </div>
);

// Component hiển thị tùy chọn dung lượng và màu sắc
interface ProductOptionsProps {
  storageOptions: string[];
  selectedStorage: string;
  onStorageChange: (storage: string) => void;
  colorOptions: { name: string; color: string }[];
  selectedColor: { name: string; color: string };
  onColorChange: (color: { name: string; color: string }) => void;
}

const ProductOptions: React.FC<ProductOptionsProps> = ({
  storageOptions,
  selectedStorage,
  onStorageChange,
  colorOptions,
  selectedColor,
  onColorChange,
}) => (
  <div className="mt-6 mb-6">
    <div>
      <h3 className="text-lg font-semibold">Dung lượng</h3>
      <div className="flex space-x-4 mt-2">
        {storageOptions.map((storage) => (
          <button
            key={storage}
            className={`px-4 py-2 rounded-full ${
              selectedStorage === storage ? 'bg-black text-white' : 'bg-gray-200 text-black'
            }`}
            onClick={() => onStorageChange(storage)}
          >
            {storage}
          </button>
        ))}
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Màu: {selectedColor.name}</h3>
      <div className="flex space-x-2 mt-2">
        {colorOptions.map((color) => (
          <button
            key={color.name}
            className={`w-8 h-8 rounded-full border-2 ${
              selectedColor.name === color.name ? 'border-blue-500' : 'border-transparent'
            }`}
            style={{ backgroundColor: color.color }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  </div>
);



// Component hiển thị bộ sưu tập hình ảnh
interface ProductImageGalleryProps {
  thumbnails: Image[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ thumbnails }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handlePrev = () => {
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : thumbnails.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => (prevIndex < thumbnails.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <div className="w-full md:w-1/2 sticky top-0 h-screen">
      <div className="relative overflow-hidden">
        <button className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center z-50 left-3" onClick={handlePrev}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <img 
          src={thumbnails[selectedIndex].url} 
          alt={thumbnails[selectedIndex].title} 
          className="w-full h-[570px] transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn"
        />
        <button className="absolute top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl flex items-center justify-center z-50 right-3" onClick={handleNext}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div className="flex space-x-2 mt-4 justify-center overflow-x-auto">
        {thumbnails.map((thumb, index) => (
          <img
            key={index}
            src={thumb.url}
            alt={thumb.title}
            className={`w-16 h-16 object-cover rounded cursor-pointer transition-transform transform hover:scale-110 ${
              selectedIndex === index ? "border-2 border-blue-500 scale-125 transition duration-300" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};




// Component promotions
interface PromotionsProps {
  promotions : string[]
}

interface PromotionsProps {
  promotions: string[];
}

const Promotions: React.FC<PromotionsProps> = ({ promotions }) => {
  if (promotions.length === 0) return null;

  const [title, ...items] = promotions;
  return (
    <div className="bg-[#242426] text-white p-4 rounded-lg mt-10 mb-5">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="list-disc list-inside space-y-1">
        {items.map((promo, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: promo }} />
        ))}
      </ul>
    </div>
  );
};

const ActionButtons: React.FC = () => {
  return (
    <div className="flex space-x-4 mt-4">
      <button className="flex items-center border-2 border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50">
        <span className="mr-2">🛒</span> Thêm Vào Giỏ Hàng
      </button>
      <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
        Mua Ngay
      </button>
    </div>
  );
};



export default ProductDetail;