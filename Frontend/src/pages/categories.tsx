import Header from '../components/layout/header';
import FilterMenu from '../components/fillter_sort';
import ProductList from '../components/productList';
import { useState, useEffect} from 'react';
import { useParams} from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

function PageCategory() {
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  let [searchParams, setSearchParams] = useSearchParams();
  const [totalProducts, setTotalProducts] = useState(0); 
  const [loading, setLoading] = useState(false);
  const page = Number(searchParams.get("pages")) || 1;
  const remainingProducts = totalProducts - products.length;
  const fetchProducts = async (currentPage: number) => {
      try {
        setLoading(true);
        // Sử dụng API endpoint dựa trên tham số type
        const response = await fetch(`http://localhost:8070/api/group-variants/groups?page=${currentPage}&size=20&type=${type?.toLocaleUpperCase()}`);            
        if (!response.ok) {
          throw new Error("Error fetching products");
        }
        const data = await response.json();
        setProducts((prevProducts) =>
          currentPage === 1 ? data["content"] : [...prevProducts, ...data["content"]]
        ); 
        if (currentPage === 1) {
          setTotalProducts(data["totalElements"]); 
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect ( () => {
      fetchProducts(page);
    }, [type,page]);

    const handleLoadMore = () => {
      const nextPage = page + 1;
      setSearchParams({ pages: nextPage.toString() }); // Cập nhật URL
    };
  return (
    <div className="pageCategory">
      <Header title={type} />
      <FilterMenu />
      <ProductList 
          grouplist={products}
      />
      {remainingProducts > 0 && (
          <div className='flex justify-center '>
            <button className="text-white bg-slate-500 p-5 m-5 hover:bg-slate-300 py-2 px-4 rounded" onClick={handleLoadMore} disabled={loading}>
            Xem thêm 
            <span className='m-1'>{remainingProducts}</span>
            sản phẩm
          </button>
          </div>
        )}
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