import '../styles/slideImages.css';
import Slider from '../components/slide';
import ProductSection from '../components/product/productSection';
// import NewsSection from '../components/newSection';
import BannerSection from '../components/layout/bannerSection';
import CategoriesSection from '../components/product/categoriesSection';

function Home() {
  return (
    <div className="home">
      <Slider slides={slides}/>
      <CategoriesSection 
        categories={categories}
      />
      <ProductSection 
        title="Điện thoại" 
        type="phone"
        size={5}
      />
      <BannerSection 
        imageSrc="images/slider/slide1.png" 
        altText="iPad mới" 
      />
      <ProductSection 
        title="Máy tính" 
        type="laptop"
        size={5}
      />
      <ProductSection 
        title="Âm thanh" 
        type="wireless_earphone"
        size={5}
      />
      <ProductSection 
        title="Phụ kiện" 
        type="backup_charger"
        size={5}
      />
      
      {/* <NewsSection /> */}
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
    name: 'Điện thoại',
    imageSrc: '/images/categories/phone.png',
    link: '/phone'
  },
  {
    id: 2,
    name: 'Máy tính',
    imageSrc: '/images/categories/laptop.png',
    link: '/laptop'
  },
  {
    id: 3,
    name: 'Âm thanh',
    imageSrc: '/images/categories/audio.png',
    link: '/audio/wireless_earphone'
  },
  {
    id: 4,
    name: 'Phụ kiện',
    imageSrc: '/images/categories/Phukien.png',
    link: '/phukien/backup_charger'
  }
];


export default Home;