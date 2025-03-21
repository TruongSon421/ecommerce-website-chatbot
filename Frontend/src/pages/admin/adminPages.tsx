import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productAPI.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await productAPI.delete(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
        console.error('Error deleting product:', err);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
                         
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Tất cả' },
    { value: 'phone', label: 'Điện thoại' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Máy tính bảng' },
    { value: 'audio', label: 'Tai nghe' },
    { value: 'accessory', label: 'Phụ kiện' }
  ];

  const getCategoryLabel = (categoryValue: string): string => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Quản lý sản phẩm</h1>
        <Link 
          to="/trang-admin-ban-hang/products/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm sản phẩm mới
        </Link>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Ảnh</th>
                <th className="py-3 px-4 text-left">Tên sản phẩm</th>
                <th className="py-3 px-4 text-left">Danh mục</th>
                <th className="py-3 px-4 text-right">Giá</th>
                <th className="py-3 px-4 text-right">Tồn kho</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img 
                      src={product.imageUrl || "https://via.placeholder.com/50"} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {product.description}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryLabel(product.category)}
                    </span>
                    {product.subCategory && (
                      <span className="inline-block ml-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {product.subCategory}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3 px-4 text-right">
                    {product.stock}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        to={`/trang-admin-ban-hang/products/edit/${product.id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
