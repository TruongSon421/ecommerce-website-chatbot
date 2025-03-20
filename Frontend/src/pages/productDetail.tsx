import ProductDetail from "../components/productDetail";
import { useParams} from 'react-router-dom';
import { useState,useEffect } from "react";

function ProductGH() {
    const {phone_id} = useParams();
    const [products, setProducts] = useState();
    useEffect(() => {
        const fetchProducts = async () => {
          try {
            // Sử dụng API endpoint dựa trên tham số type
            const response = await fetch(`http://localhost:8070/api/products/getPhone/${phone_id}`);
            if (!response.ok) {
              throw new Error("Error fetching products");
            }
            const data = await response.json();
            setProducts(data);
          } catch (error) {
            console.error("Error fetching products:", error);
          }
        };
    
        fetchProducts();
      }, []);
    
    return (
        <div className="product-detail">
            {products ? <ProductDetail product={products} /> : <div>Product not found</div>}
        </div>
    );
};



export default ProductGH;