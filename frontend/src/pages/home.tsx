import '../styles/slideImages.css';
import Slider from '../components/slide';
import ProductSection from '../components/product/productSection';
// import NewsSection from '../components/newSection';
import BannerSection from '../components/layout/bannerSection';
import CategoriesSection from '../components/product/categoriesSection';

function Home() {
  return (
    <div className="home">
      <Slider 
        slides={slides}
        aspectRatio="banner" // Tỉ lệ banner cho slider chính
        autoSlide={true}
        slideInterval={5000}
      />
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
        title="Laptop" 
        type="laptop"
        size={5}
      />
      <ProductSection 
        title="Tai nghe" 
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
    image: "https://images.macrumors.com/article-new/2023/11/iPhone-16-Pro-Mock-Header-Updated.jpg",
    title: 'iPhone 15 mới - Siêu phẩm từ Apple',
    link: '/detail/phone/6801ddb47fa8c71ab16251c7'
  },
  {
    id: 2,
    image: "https://www.notebookcheck.net/fileadmin/Notebooks/Apple/MacBook_Pro_14_2023_M3/IMG_1034.JPG",
    title: 'Laptop MacBook Pro 14 inch M4 16GB/512GB',
    link: '/detail/laptop/6801ddde7fa8c71ab1625382'
  },
  {
    id: 3,
    image: "https://happyphone.vn/wp-content/uploads/2024/07/Tai-nghe-Bluetooth-Samsung-Galaxy-Buds3-Galaxy-AI.png",
    title: 'Tai nghe TWS Samsung Galaxy Buds3 Pro R630N',
    link: '/detail/wireless_earphone/68518ff8b33de75ae44553c2'
  },
  {
    id: 4,
    image: "https://www.amazona.de/wp-content/uploads/2026/01/10-apple-airpodsmax-foto-rotated-e1610043098439.jpeg",
    title: 'AirPods Max cổng USB C',
    link: '/detail/headphone/68517e875379a67d7cdc28ac'
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
    name: 'Tai nghe',
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