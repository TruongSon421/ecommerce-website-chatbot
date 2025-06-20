import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VNPayBackendReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Lấy tất cả parameters từ VNPay
    const vnpayParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      vnpayParams[key] = value;
    });

    const transactionId = searchParams.get('vnp_TxnRef');
    const responseCode = searchParams.get('vnp_ResponseCode');
    
    console.log('VNPay backend return params:', vnpayParams);

    if (!transactionId) {
      // Redirect to failed page if no transaction ID
      navigate('/payment-failed', { 
        state: { 
          message: 'Không tìm thấy mã giao dịch từ VNPay' 
        } 
      });
      return;
    }

    // Convert tất cả VNPay params thành query string cho VNPayReturnPage
    const queryString = new URLSearchParams(vnpayParams).toString();
    
    // Redirect đến VNPayReturnPage với tất cả parameters
    navigate(`/vnpay-return?${queryString}`, { replace: true });
    
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🔄 Đang chuyển hướng...</h1>
        <p className="text-gray-600 mb-4">Đang xử lý kết quả thanh toán từ VNPay...</p>
        
        <div className="flex justify-center mb-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPayBackendReturnPage; 