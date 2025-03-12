import React from "react";
import CustomSlider from "./customSlider";

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({title}) => {
   return title==='' ? (
        <CustomSlider slides={slides} isHome={true} />
   ) : (
        <div className="">
            <h1 className="text-center text-white font-bold mt-12 mb-8 font-serif text-6xl">
            {title?.toUpperCase()}
        </h1>
        <CustomSlider slides={slides} isHome={false} />
        </div>
        
   )
};

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
  

export default Header;