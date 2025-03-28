// src/pages/admin/ProductManagement.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Định nghĩa interface cho sản phẩm
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// Giả lập dữ liệu từ API (có thể thay bằng fetch thực tế)
const fetchProducts = async (): Promise<Product[]> => {
  return [
    { id: "1", name: "iPhone 13", price: 999, stock: 50 },
    { id: "2", name: "Samsung Galaxy S23", price: 899, stock: 30 },
    { id: "3", name: "MacBook Pro", price: 1999, stock: 20 },
  ];
};

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Lấy danh sách sản phẩm khi component mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts(); // Thay bằng API thực tế nếu có
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Xóa sản phẩm
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== id));
      // Gọi API xóa nếu có: await api.delete(`/api/products/${id}`);
    }
  };

  // Lưu chỉnh sửa sản phẩm
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      setProducts(
        products.map((p) =>
          p.id === editProduct.id ? { ...editProduct } : p
        )
      );
      setEditProduct(null);
      // Gọi API cập nhật nếu có: await api.put(`/api/products/${editProduct.id}`, editProduct);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Management</h1>

      {/* Nút thêm sản phẩm */}
      <div className="mb-6">
        <Link
          to="/admin/product/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Product
        </Link>
      </div>

      {/* Bảng danh sách sản phẩm */}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{product.id}</td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">${product.price.toLocaleString()}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setEditProduct(product)}
                      className="text-blue-500 hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chỉnh sửa sản phẩm */}
      {editProduct && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Price</label>
                <input
                  type="number"
                  value={editProduct.price}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Stock</label>
                <input
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      stock: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;