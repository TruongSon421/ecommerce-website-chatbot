import '../styles/slideImages.css';
import Slider from '../components/slide';
import ProductSection from '../components/productSection';
import NewsSection from '../components/newSection';
import BannerSection from '../components/bannerSection';
import CategoriesSection from '../components/categoriesSection';
function Home() {
  return (
    <div className="home">
      <Slider slides={slides}/>
      <CategoriesSection 
        categories={categories}
      />
      <ProductSection 
        title="Phone" 
        products={iPhoneProducts} 
      />
      <BannerSection 
        imageSrc="images/slider/slide1.png" 
        altText="iPad mới" 
      />
      {/* <ProductSection 
        title="Mac" 
        products={macProducts} 
      />
      <ProductSection 
        title="Audio" 
        products={watchProducts} 
      /> */}
      
      <NewsSection />
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

// Dữ liệu mẫu
const iPhoneProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    current_prices: ["34990000"],
    old_prices: "34990000" ,
    imageSrc: '/images/categories/phone.png',
    images : [
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Slider/oppo-find-n3-flip-hong638357727095402878.jpg",
        "title": ""
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-1-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-2-180x125.jpeg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-3-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-4-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-5-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-6-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-7-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-8-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-9-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-10-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-11-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-12-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-13-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-14-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-15-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-16-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Kit/oppo-find-n3-flip-phu-kien-org.jpeg",
        "title": "Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Ốp lưng, Cáp Type C, Củ sạc nhanh rời đầu Type A"
      }
    ],
    discount: 5,
    isNew: true
  },
  {
    id: 2,
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    current_prices: ["34990000"],
    old_prices: "34990000" ,
    imageSrc: '/images/categories/phone.png',
    images : [
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Slider/oppo-find-n3-flip-hong638357727095402878.jpg",
        "title": ""
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-1-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-2-180x125.jpeg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-3-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-4-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-5-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-6-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-7-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-8-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-9-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-10-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-11-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-12-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-13-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-14-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-15-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-16-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Kit/oppo-find-n3-flip-phu-kien-org.jpeg",
        "title": "Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Ốp lưng, Cáp Type C, Củ sạc nhanh rời đầu Type A"
      }
    ],
    discount: 5,
    isNew: true
  },
  {
    id: 3,
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    current_prices: ["34990000"],
    old_prices: "34990000" ,
    imageSrc: '/images/categories/phone.png',
    images : [
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Slider/oppo-find-n3-flip-hong638357727095402878.jpg",
        "title": ""
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-1-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-2-180x125.jpeg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-3-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-4-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-5-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-6-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-7-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-8-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-9-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-10-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-11-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-12-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-13-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-14-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-15-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-16-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Kit/oppo-find-n3-flip-phu-kien-org.jpeg",
        "title": "Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Ốp lưng, Cáp Type C, Củ sạc nhanh rời đầu Type A"
      }
    ],
    discount: 5,
    isNew: true
  },
  {
    id: 4,
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    current_prices: ["34990000"],
    old_prices: "34990000" ,
    imageSrc: '/images/categories/phone.png',
    images : [
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Slider/oppo-find-n3-flip-hong638357727095402878.jpg",
        "title": ""
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-1-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-2-180x125.jpeg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-3-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-4-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-5-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-6-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-7-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-8-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-9-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-10-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-11-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-12-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-13-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-14-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-15-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-16-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Kit/oppo-find-n3-flip-phu-kien-org.jpeg",
        "title": "Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Ốp lưng, Cáp Type C, Củ sạc nhanh rời đầu Type A"
      }
    ],
    discount: 5,
    isNew: true
  },
  {
    id: 5,
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    current_prices: ["34990000"],
    old_prices: "34990000" ,
    imageSrc: '/images/categories/phone.png',
    images : [
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Slider/oppo-find-n3-flip-hong638357727095402878.jpg",
        "title": ""
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-1-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-2-180x125.jpeg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-3-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-4-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-5-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-6-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-7-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-8-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-9-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-10-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-11-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-12-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-13-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-14-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-15-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/oppo-find-n3-flip-pink-16-180x125.jpg",
        "title": "Điện thoại OPPO Find N3 Flip 5G 12GB/256GB Hồng Màu Hồng"
      },
      {
        "url": "https://cdn.tgdd.vn/Products/Images/42/317981/Kit/oppo-find-n3-flip-phu-kien-org.jpeg",
        "title": "Bộ sản phẩm gồm: Hộp, Sách hướng dẫn, Cây lấy sim, Ốp lưng, Cáp Type C, Củ sạc nhanh rời đầu Type A"
      }
    ],
    discount: 5,
    isNew: true
  }
];

const macProducts = [
  {
    id: 5,
    name: 'MacBook Pro 14"',
    price: 39990000,
    imageSrc: '/images/categories/laptop.png',
    discount: 0,
    isNew: true
  },
  {
    id: 6,
    name: 'MacBook Air 13"',
    price: 22990000,
    imageSrc: '/images/categories/laptop.png',
    discount: 5,
    isNew: false
  },
  {
    id: 7,
    name: 'iMac 24"',
    price: 33990000,
    imageSrc: '/images/categories/laptop.png',
    discount: 0,
    isNew: false
  },
  {
    id: 8,
    name: 'Mac mini',
    price: 15990000,
    imageSrc: '/images/categories/laptop.png',
    discount: 0,
    isNew: false
  }
];

const watchProducts = [
  {
    id: 9,
    name: 'Apple Watch Series 9',
    price: 11990000,
    imageSrc: '/images/categories/laptop.png',
    discount: 3,
    isNew: true
  },
  {
    id: 10,
    name: 'Apple Watch Ultra 2',
    price: 22990000,
    imageSrc: '/images/categories/laptop.png',
    discount: 0,
    isNew: true
  }
];
export default Home;