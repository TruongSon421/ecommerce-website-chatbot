import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAppDispatch, useAppSelector } from '../store/hooks'; // Assuming you have Redux hooks
// import { clearCart, removeFromCart, updateQuantity } from '../store/cartSlice'; // Assuming a cartSlice

// Mock item structure - align with your actual product/cart item structure
interface CartItem {
  id: string; // Corresponds to productId in cart-service
  name: string; // Corresponds to productName
  price: number;
  quantity: number;
  imageUrl?: string;
  color?: string; // Added color as it's part of the cart item in cart-service
}

// Mock user ID - in a real app, this would come from auth context or similar
const MOCK_USER_ID = '2';
const CART_API_BASE_URL = 'http://localhost:8070'; // Adjust as necessary

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<string>('123 Test Street');
  const [paymentMethod, setPaymentMethod] = useState<string>('CREDIT_CARD');

  // Temporary: For adding mock items to test UI and checkout flow
  const [newItemId, setNewItemId] = useState<string>('P1002');
  const [newItemName, setNewItemName] = useState<string>('Sản phẩm Mock Mới');
  const [newItemPrice, setNewItemPrice] = useState<number>(300000);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemColor, setNewItemColor] = useState<string>('Blue');


  // Function to fetch cart from backend
  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, use a proper API client and handle auth tokens
      const response = await fetch(`${CART_API_BASE_URL}/api/carts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if your API requires it
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0cnVvbmdzb24iLCJpYXQiOjE3NDc3NjYyMTMsImV4cCI6MTc0Nzc2OTgxMywicm9sZXMiOlt7ImF1dGhvcml0eSI6IlJPTEVfVVNFUiJ9XSwidXNlcklkIjoyfQ.ZrnZ6RYu2hUpojWKfYzjXtKasj21S2HcmA1LtbBm57M'

        },
      });
      if (!response.ok) {
        if (response.status === 404) { // Cart not found, initialize a new one or let user do it
          setCartItems([]); // Assuming an empty cart if not found
          // Optionally, call createCart here or provide a button for the user
          console.log('Cart not found for user, starting with an empty cart.');
        } else {
          throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        // Adapt fetched data to CartItem structure if needed
        // Assuming data.items is an array of items compatible with CartItem
        setCartItems(data.items?.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          imageUrl: item.imageUrl || `https://via.placeholder.com/100x100.png?text=${item.productName.substring(0,10)}` // Fallback image
        })) || []);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setCartItems([]); // Clear items on error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add item to cart via API
  const addItemToApiCart = async (item: Omit<CartItem, 'imageUrl'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CART_API_BASE_URL}/api/carts/items?userId=${MOCK_USER_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE' 
        },
        body: JSON.stringify({ // Ensure payload matches backend DTO
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            color: item.color
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to add item: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      // After successfully adding, refetch the cart to update the UI
      await fetchCart(); 
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred adding item');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCart();
  }, []); // Fetch cart on component mount

  const handleQuantityChange = (id: string, color: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    // This should ideally call an update API endpoint
    // For now, let's assume direct update or refetch after an action
    console.log(`Updating quantity for ${id} (color: ${color}) to ${newQuantity} - API call needed`);
    // Optimistically update UI then call API, or call API then refetchCart()
    setCartItems(items => items.map(item => 
        item.id === id && item.color === color ? { ...item, quantity: newQuantity } : item
    ));
    // Example: dispatch(updateQuantity({ productId: id, color, quantity: newQuantity, userId: MOCK_USER_ID }));
    // Then potentially refetch cart or update from response.
    // For simplicity, we'll rely on manual add/remove and refetching or a dedicated update endpoint.
  };

  const handleRemoveItem = (id: string, color: string | undefined) => {
    // This should call a remove API endpoint
    console.log(`Removing item ${id} (color: ${color}) - API call needed`);
    // Optimistically update UI then call API, or call API then refetchCart()
    setCartItems(items => items.filter(item => !(item.id === id && item.color === color)));
    // Example: dispatch(removeFromCart({ productId: id, color, userId: MOCK_USER_ID }));
    // Then potentially refetch cart.
    // For now, we will simulate by filtering locally and a full 'clear cart' might be a full refetch.
    // A more granular API would be: DELETE /api/carts/items?userId=...&productId=...&color=...
  };

  const handleClearCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CART_API_BASE_URL}/api/carts/clear?userId=${MOCK_USER_ID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`Failed to clear cart: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      setCartItems([]); // Clear locally on success
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while clearing cart');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for the mock add item form
  const handleAddMockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemId || !newItemName || newItemPrice <=0 || newItemQuantity <=0 || !newItemColor) {
        alert('Please fill all fields for the new item correctly.');
        return;
    }
    const itemToAdd: Omit<CartItem, 'imageUrl'> = {
        id: newItemId,
        name: newItemName,
        price: newItemPrice,
        quantity: newItemQuantity,
        color: newItemColor,
    };
    addItemToApiCart(itemToAdd);
    // Clear form
    setNewItemId('');
    setNewItemName('');
    setNewItemPrice(0);
    setNewItemQuantity(1);
    setNewItemColor('');
  };


  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before proceeding to checkout.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const checkoutPayload = {
      checkoutRequest: {
        userId: MOCK_USER_ID,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        // Add other fields like notes, discountCode if your backend expects them
      },
      // In this version, we checkout all items in the cart.
      // The cart-test example had 'selectedItems', but cart service checkout typically uses all items from user's cart.
      // If specific items selection is needed, the backend `/api/carts/checkout` needs to support it.
      // For now, we assume the backend uses the entire cart associated with MOCK_USER_ID.
      selectedItems: cartItems.map(item => ({ // This structure might be specific to how backend expects it
        productId: item.id,
        color: item.color,
      }))
    };
    console.log(checkoutPayload);
    try {
      const response = await fetch(`${CART_API_BASE_URL}/api/carts/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0cnVvbmdzb24iLCJpYXQiOjE3NDc3NjYyMTMsImV4cCI6MTc0Nzc2OTgxMywicm9sZXMiOlt7ImF1dGhvcml0eSI6IlJPTEVfVVNFUiJ9XSwidXNlcklkIjoyfQ.ZrnZ6RYu2hUpojWKfYzjXtKasj21S2HcmA1LtbBm57M'
        },
        body: JSON.stringify(checkoutPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Checkout failed: ${response.status}`);
      }

      // Handle successful checkout
      console.log('Checkout successful:', responseData);
      
      // Clear cart after successful checkout
      await handleClearCart();

      // Redirect based on payment method
      if (paymentMethod === 'VNPAY' && responseData.vnpayRedirectUrl) {
        // Redirect to VNPAY payment page
        window.location.href = responseData.vnpayRedirectUrl;
      } else if (paymentMethod === 'QR_CODE') {
        // Redirect to QR code payment page
        navigate('/payment/qr-code', { 
          state: { 
            orderId: responseData.orderId,
            amount: totalAmount,
            paymentDetails: responseData
          } 
        });
      } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
        // Redirect to card payment page
        navigate('/payment/card', { 
          state: { 
            orderId: responseData.orderId,
            amount: totalAmount,
            paymentMethod: paymentMethod,
            paymentDetails: responseData
          } 
        });
      } else if (paymentMethod === 'TRANSFER_BANKING') {
        // Redirect to banking transfer information page
        navigate('/payment/banking', { 
          state: { 
            orderId: responseData.orderId,
            amount: totalAmount,
            paymentDetails: responseData
          } 
        });
      } else if (paymentMethod === 'COD') {
        // Redirect to order confirmation page for COD
        navigate('/order-confirmation', { 
          state: { 
            orderId: responseData.orderId,
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            amount: totalAmount
          } 
        });
      } else {
        // Fallback for any other payment methods
        navigate('/order-confirmation', { 
          state: { 
            orderId: responseData.orderId,
            paymentMethod: paymentMethod,
            paymentStatus: responseData.paymentStatus || 'PENDING',
            amount: totalAmount
          } 
        });
      }

    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during checkout');
      alert(`Checkout failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && cartItems.length === 0) { // Initial loading state
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
        <p className="text-gray-600">Đang tải giỏ hàng...</p>
      </div>
    );
  }
  
  if (error && cartItems.length === 0) { // Error state when cart can't be loaded
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
        <p className="text-red-500 mb-4">Lỗi: {error}</p>
        <button
          onClick={fetchCart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mr-2"
        >
          Thử lại
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
        >
          Về trang chủ
        </button>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Giỏ hàng của bạn</h1>

      {/* Section to add mock item - temporary for testing */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Thêm sản phẩm vào giỏ (Test)</h2>
        <form onSubmit={handleAddMockItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newItemId" className="block text-sm font-medium text-gray-700">Product ID</label>
              <input type="text" id="newItemId" value={newItemId} onChange={(e) => setNewItemId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="newItemName" className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
              <input type="text" id="newItemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="newItemPrice" className="block text-sm font-medium text-gray-700">Giá</label>
              <input type="number" id="newItemPrice" value={newItemPrice} onChange={(e) => setNewItemPrice(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="newItemQuantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
              <input type="number" id="newItemQuantity" value={newItemQuantity} onChange={(e) => setNewItemQuantity(Number(e.target.value))} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="newItemColor" className="block text-sm font-medium text-gray-700">Màu sắc</label>
              <input type="text" id="newItemColor" value={newItemColor} onChange={(e) => setNewItemColor(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150" disabled={isLoading}>
            {isLoading ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      
      {cartItems.length === 0 ? (
         <div className="text-center p-8 bg-white shadow-lg rounded-lg">
            <p className="text-gray-600 text-xl mb-8">Giỏ hàng của bạn đang trống.</p>
            <button
              onClick={() => navigate('/')} // Navigate to product listing or home
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-150"
            >
              Tiếp tục mua sắm
            </button>
         </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.color}`} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0">
                <div className="flex items-center mb-4 sm:mb-0">
                  <img 
                    src={item.imageUrl || `https://via.placeholder.com/100x100.png?text=${item.name.substring(0,10)}`} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-sm text-gray-500">Màu: {item.color || 'N/A'}</p>
                    <p className="text-gray-600">{item.price.toLocaleString('vi-VN')} đ</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center border rounded-md mr-4">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.color, item.quantity - 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-l-md"
                      disabled={item.quantity <= 1 || isLoading}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.color, item.quantity + 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-r-md"
                      disabled={isLoading}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id, item.color)}
                    className="text-red-500 hover:text-red-700 font-semibold transition duration-150"
                    disabled={isLoading}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Thông tin giao hàng</h2>
                <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">Địa chỉ giao hàng</label>
                    <input 
                        type="text" 
                        id="shippingAddress" 
                        value={shippingAddress} 
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nhập địa chỉ giao hàng"
                    />
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Phương thức thanh toán</h2>
                <select 
                    id="paymentMethod" 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="QR_CODE">QR_CODE</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">DEBIT_CARD</option>
                    <option value="TRANSFER_BANKING">TRANSFER_BANKING</option>
                    <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                    {/* Add other payment methods as needed */}
                    {/* <option value="CREDIT_CARD">Credit Card</option> */}
                    {/* <option value="TRANSFER_BANKING">TRANSFER_BANKING</option> */}
                </select>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tổng cộng:</h2>
              <p className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString('vi-VN')} đ</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <button
                onClick={handleClearCart}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-md transition duration-150"
                disabled={isLoading || cartItems.length === 0}
              >
                Xóa giỏ hàng
              </button>
              <button
                onClick={handleProceedToCheckout}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-150"
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage; 