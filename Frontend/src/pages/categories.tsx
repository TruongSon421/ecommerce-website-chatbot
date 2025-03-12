import Header from '../components/header';
import ProductSection from '../components/productSection';
import FilterMenu from '../components/fillter_sort';
import ProductList from '../components/productList';
import NewsSection from '../components/newSection';
import BannerSection from '../components/bannerSection';
import CategoriesSection from '../components/categoriesSection';
import { useState, useEffect} from 'react';
import { useParams} from 'react-router-dom';


function PageCategory() {
  const {type} = useParams();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (type === `phone`) {
          const response = await fetch("phone_list.json");
          const data = await response.json();
          setProducts(data); 
        }
        else {
          const response = await fetch("laptop_list.json");
          const data = await response.json();
          setProducts(data); 
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
  
    fetchProducts();
  }, []);
  
  return (
    <div className="pageCategory">
      <Header title={type} />
      <FilterMenu />
      <ProductList 
          grouplist={products}
      />
    </div>
  );
}


const slides = [
  {
    id: 1,
    image: '/images/slider/slide1.png',
    title: 'iPhone 15 mới - Siêu phẩm từ Apple',
    link: '/iphone-15'
  },
  {
    id: 2,
    image: '/images/slider/slide2.png',
    title: 'MacBook Air M2 - Mỏng nhẹ, mạnh mẽ',
    link: '/macbook-air'
  },
  {
    id: 3,
    image: '/images/slider/slide3.png',
    title: 'Apple Watch Series 9 - Đo nhịp tim, SpO2',
    link: '/apple-watch-series-9'
  },
  {
      id: 4,
      image: '/images/slider/slide4.png',
      title: 'AirPods 3 - Chống ồn, chống nước',
      link: '/airpods-3'
  },
  {
      id: 5,
      image: '/images/slider/slide5.png',
      title: 'iPad Pro 2022 - Màn hình ProMotion',
      link: '/ipad-pro-2022'
  }
];

const categories = [
  {
    id: 1,
    name: 'Phone',
    imageSrc: '/images/categories/phone.png',
    link: '/phone'
  },
  {
    id: 2,
    name: 'Laptop',
    imageSrc: '/images/categories/laptop.png',
    link: '/laptop'
  },
  {
    id: 3,
    name: 'Tablet',
    imageSrc: '/images/categories/tablet.png',
    link: '/tablet'
  },
  {
    id: 4,
    name: 'Audio',
    imageSrc: '/images/categories/audio.png',
    link: '/audio'
  },
  {
    id: 5,
    name: 'Phụ kiện',
    imageSrc: '/images/categories/Phukien.png',
    link: '/phukien'
  }
];



export default PageCategory;