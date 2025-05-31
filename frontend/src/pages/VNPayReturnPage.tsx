import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VNPayReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get VNPay return parameters
    const transactionId = searchParams.get('vnp_TxnRef');
    const responseCode = searchParams.get('vnp_ResponseCode');
    
    if (!transactionId) {
      // Redirect to payment failed if no transaction ID
      navigate('/payment-failed', { 
        state: { 
          message: 'Không tìm thấy mã giao dịch từ VNPay' 
        } 
      });
      return;
    }

    // Redirect to payment processing page with transaction ID
    // The PaymentProcessingPage will handle status checking and display appropriate UI
    navigate(`/payment-processing?transactionId=${transactionId}&vnp_ResponseCode=${responseCode}`);
  }, [navigate, searchParams]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Xử lý thanh toán VNPay</h1>
        <p className="text-gray-600">Đang xử lý kết quả thanh toán từ VNPay...</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage; 