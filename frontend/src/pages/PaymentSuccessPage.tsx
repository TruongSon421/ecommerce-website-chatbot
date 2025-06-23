import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Get data from backend redirect query parameters
    const orderIdFromQuery = searchParams.get('orderId');
    const messageFromQuery = searchParams.get('message');
    
    setOrderId(orderIdFromQuery || '');
    setMessage(messageFromQuery || 'Thanh toán thành công qua VNPay');
    
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/purchase-history');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        {/* Success Animation */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-green-600 mb-2">🎉 Thanh toán thành công!</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {orderId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-800">
              <span className="font-medium">Mã đơn hàng:</span> 
              <span className="font-bold ml-1">#{orderId}</span>
            </p>
          </div>
        )}
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-green-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm font-medium">Đơn hàng đang được xử lý</span>
          </div>
          <p className="text-xs text-green-600 mt-2">Chúng tôi sẽ liên hệ với bạn sớm nhất</p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/purchase-history')}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            📋 Xem lịch sử mua hàng
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            🏠 Tiếp tục mua sắm
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Tự động chuyển đến lịch sử mua hàng trong 5 giây...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 