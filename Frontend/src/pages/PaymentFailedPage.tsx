import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');
  const errorMessage = queryParams.get('message') || 'Thanh toán không thành công.';
  const errorCode = queryParams.get('code');

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-red-500 text-6xl mb-6">✕</div>
        <h1 className="text-2xl font-bold mb-4">Thanh toán thất bại</h1>
        
        <p className="text-gray-700 mb-6">
          {errorMessage}
          {errorCode && <span className="block text-sm text-gray-500 mt-2">Mã lỗi: {errorCode}</span>}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {orderId && (
            <button
              onClick={() => navigate(`/payment/${orderId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
            >
              Thử lại
            </button>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md"
          >
            Quay về trang chủ
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Nếu bạn đã bị trừ tiền nhưng vẫn nhận được thông báo lỗi này,</p>
          <p>vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@example.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage; 