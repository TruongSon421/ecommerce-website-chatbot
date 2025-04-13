// src/pages/PageCategory.tsx
import Header from '../components/layout/header';
import ProductList from '../components/productList';
import ProductFilter from '../components/ProductFilter';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

function PageCategory() {
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  let [searchParams, setSearchParams] = useSearchParams();
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: string[] | number[] }>({});
  const [sortByPrice, setSortByPrice] = useState<string>('desc');
  const page = Number(searchParams.get('pages')) || 0;
  const remainingProducts = totalProducts - products.length;

  const fetchProducts = async (currentPage: number, appliedFilters: { [key: string]: string[] | number[] }) => {
    try {
      setLoading(true);
      const queryParams: string[] = [];

      queryParams.push(`page=${currentPage}`);
      queryParams.push(`size=20`);

      if (type) {
        queryParams.push(`type=${type.toUpperCase()}`);
      }

      queryParams.push(`sortByPrice=${sortByPrice}`);

      if (appliedFilters.brand && (appliedFilters.brand as string[]).length > 0) {
        queryParams.push(`brand=${(appliedFilters.brand as string[]).join(',')}`);
      }

      if (appliedFilters.tags && (appliedFilters.tags as string[]).length > 0) {
        queryParams.push(`tags=${(appliedFilters.tags as string[]).join(',')}`);
      }

      if (appliedFilters.priceRange) {
        const [minPrice, maxPrice] = appliedFilters.priceRange as number[];
        queryParams.push(`minPrice=${minPrice}`);
        queryParams.push(`maxPrice=${maxPrice}`);
      }

      if (appliedFilters.ram && (appliedFilters.ram as string[]).length > 0) {
        queryParams.push(`ram=${(appliedFilters.ram as string[]).join(',')}`);
      }
      if (appliedFilters.resolution && (appliedFilters.resolution as string[]).length > 0) {
        queryParams.push(`resolution=${(appliedFilters.resolution as string[]).join(',')}`);
      }
      if (appliedFilters.refresh_rate && (appliedFilters.refresh_rate as string[]).length > 0) {
        queryParams.push(`refresh_rate=${(appliedFilters.refresh_rate as string[]).join(',')}`);
      }
      if (appliedFilters.cpu && (appliedFilters.cpu as string[]).length > 0) {
        queryParams.push(`cpu=${(appliedFilters.cpu as string[]).join(',')}`);
      }
      if (appliedFilters.storage && (appliedFilters.storage as string[]).length > 0) {
        queryParams.push(`storage=${(appliedFilters.storage as string[]).join(',')}`);
      }

      const url = `http://localhost:8070/api/group-variants/groups?${queryParams.join('&')}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error fetching products');
      }
      const data = await response.json();
      setProducts((prevProducts) =>
        currentPage === 0 ? data['content'] : [...prevProducts, ...data['content']]
      );
      if (currentPage === 0) {
        setTotalProducts(data['totalElements']);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, filters);
  }, [type, page, filters, sortByPrice]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setSearchParams({ pages: nextPage.toString() });
  };

  const handleApplyFilters = (newFilters: { [key: string]: string[] | number[] }) => {
    setFilters(newFilters);
    setSearchParams({ pages: '0' });
  };

  const handleSortChange = (order: string) => {
    setSortByPrice(order);
    setSearchParams({ pages: '0' });
  };

  return (
    <div className="pageCategory">
      <Header title={type} />
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="md:w-1/4">
          {type ? (
            <ProductFilter
              type={type}
              onApplyFilters={handleApplyFilters}
              onSortChange={handleSortChange}
              sortByPrice={sortByPrice}
            />
          ) : (
            <div>Không có bộ lọc cho loại sản phẩm này.</div>
          )}
        </div>
        <div className="md:w-3/4">
          <ProductList grouplist={products} />
          {remainingProducts > 0 && (
            <div className="flex justify-center">
              <button
                className="text-white bg-slate-500 p-5 m-5 hover:bg-slate-300 py-2 px-4 rounded"
                onClick={handleLoadMore}
                disabled={loading}
              >
                Xem thêm <span className="m-1">{remainingProducts}</span> sản phẩm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageCategory;