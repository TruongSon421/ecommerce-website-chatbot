import { useState } from "react";

const FilterMenu: React.FC = () => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number[]>([0, 180]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const brands = ["HP", "ASUS", "Acer", "Lenovo", "Dell", "MSI", "MacBook", "Gigabyte"];
  const prices = ["Dưới 10 triệu", "10 - 15 triệu", "15 - 20 triệu", "20 - 25 triệu", "25 - 30 triệu", "Trên 30 triệu"];
  const types = ["Laptop AI", "Gaming", "Học tập, văn phòng", "Đồ họa", "Kỹ thuật", "Mỏng nhẹ"];
  const sizes = ["Khoảng 13 inch", "Khoảng 14 inch", "Khoảng 15 inch", "Trên 16 inch", "14.5 inch", "18 inch"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 border rounded-md border-blue-600"
      >
        <span>🛠️ Lọc</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 w-[600px] p-4 mt-2 bg-white shadow-lg rounded-md">
          {/* Hãng */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Hãng</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() =>
                    setSelectedBrands((prev) =>
                      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
                    )
                  }
                  className={`border px-3 py-1 rounded-md ${
                    selectedBrands.includes(brand) ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Giá */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Giá</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {prices.map((price) => (
                <button
                  key={price}
                  onClick={() =>
                    setSelectedPrice(selectedPrice.includes(price.length) ? [] : [price.length])
                  }
                  className={`border px-3 py-1 rounded-md ${
                    selectedPrice.includes(price.length) ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Loại sản phẩm */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Loại sản phẩm</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedTypes((prev) =>
                      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                    )
                  }
                  className={`border px-3 py-1 rounded-md ${
                    selectedTypes.includes(type) ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Kích cỡ màn hình */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Kích cỡ màn hình</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setSelectedSizes((prev) =>
                      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                    )
                  }
                  className={`border px-3 py-1 rounded-md ${
                    selectedSizes.includes(size) ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Nút đóng */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 mt-4 text-white bg-red-500 rounded-md"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterMenu;
