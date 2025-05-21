import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock function to simulate creating an order and getting a transaction ID
// In a real app, this would call your backend order service
const createOrderAndGetTransactionId = async (cartDetails: any): Promise<string> => {
  console.log('Simulating order creation with:', cartDetails);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500)); 
  // Generate a mock transaction ID (in a real app, this comes from your backend)
  const mockTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  console.log('Mock transaction ID generated:', mockTransactionId);
  return mockTransactionId;
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you'd get cart details from Redux store or props/state
  const mockCartDetails = {
    items: [
      { productId: 'prod_123', name: 'Sản phẩm Mock 1', quantity: 1, price: 250000 },
      { productId: 'prod_456', name: 'Sản phẩm Mock 2', quantity: 2, price: 450000 },
    ],
    totalAmount: 1150000, 
    userId: 'user_mock_001', // Replace with actual user ID
    shippingAddress: '123 Đường ABC, Quận XYZ, TP. HCM',
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Simulate creating an order with your backend
      // This would involve sending cart details, user info, shipping address, etc.
      // The backend would then create an order and return a unique transaction ID.
      const transactionId = await createOrderAndGetTransactionId(mockCartDetails);

      // After successfully creating the order and getting a transaction ID, 
      // redirect to the PaymentPage
      navigate(`/payment/${transactionId}`);

    } catch (err) {
      console.error('Error during checkout process:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Xác nhận đơn hàng</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Chi tiết đơn hàng (Mock)</h2>
        
        {/* Display order summary - In a real app, fetch this or pass from cart */}
        <div className="mb-6 space-y-3">
          {mockCartDetails.items.map(item => (
            <div key={item.productId} className="flex justify-between items-center text-gray-700">
              <span>{item.name} (x{item.quantity})</span>
              <span>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between items-center font-bold text-lg text-gray-800">
            <span>Tổng cộng:</span>
            <span>{mockCartDetails.totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Địa chỉ giao hàng</h3>
          <p className="text-gray-700">{mockCartDetails.shippingAddress}</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Lỗi</p>
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleConfirmOrder}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Xác nhận và Thanh toán'
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage; 