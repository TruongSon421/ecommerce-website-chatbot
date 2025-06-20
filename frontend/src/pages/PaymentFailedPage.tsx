import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Get error message from URL params or state
  const message = searchParams.get('message') || 
                 location.state?.message || 
                 'Thanh toán không thành công. Vui lòng thử lại.';
  
  const orderId = searchParams.get('orderId') || location.state?.orderId;
  const transactionId = searchParams.get('transactionId') || location.state?.transactionId;
  const responseCode = searchParams.get('responseCode') || location.state?.responseCode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        {/* Failed Animation */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-red-600 mb-2">❌ Thanh toán thất bại</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {/* Transaction details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 space-y-2">
          {transactionId && (
            <p className="text-sm text-red-800">
              <span className="font-medium">Mã giao dịch:</span> 
              <span className="font-mono ml-1">{transactionId}</span>
            </p>
          )}
          {orderId && (
            <p className="text-sm text-red-800">
              <span className="font-medium">Mã đơn hàng:</span> 
              <span className="font-bold ml-1">#{orderId}</span>
            </p>
          )}
          {responseCode && (
            <p className="text-sm text-red-800">
              <span className="font-medium">Mã lỗi VNPay:</span> 
              <span className="font-mono ml-1">{responseCode}</span>
            </p>
          )}
        </div>
        
        {/* Error details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-2">💡 Các bước tiếp theo:</h3>
          <ul className="text-xs text-gray-600 text-left space-y-1">
            <li>• Kiểm tra số dư tài khoản</li>
            <li>• Thử lại với phương thức thanh toán khác</li>
            <li>• Liên hệ ngân hàng nếu vấn đề tiếp diễn</li>
          </ul>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            🔄 Thử lại thanh toán
          </button>
          
          <button
            onClick={() => navigate('/purchase-history')}
            className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            📋 Xem lịch sử mua hàng
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            🏠 Về trang chủ
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            📞 Cần hỗ trợ? Liên hệ hotline: <span className="font-medium">1900-xxxx</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage; 