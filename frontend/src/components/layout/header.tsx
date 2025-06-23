import React from "react";
import CustomSlider from "../customSlider";

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

export default Header;