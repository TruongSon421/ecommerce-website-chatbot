import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { checkPaymentStatus } from '../services/paymentService';

const PaymentProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | null>(null);
  const [message, setMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [showFinalState, setShowFinalState] = useState(false);

  useEffect(() => {
    // Check if we have status from backend redirect (payment-success page)
    const statusFromQuery = searchParams.get('status');
    const orderIdFromQuery = searchParams.get('orderId');
    const messageFromQuery = searchParams.get('message');
    
    if (statusFromQuery) {
      // Handle backend redirect results
      if (statusFromQuery === 'success') {
        setStatus('SUCCESS');
        setOrderId(orderIdFromQuery || '');
        setMessage(messageFromQuery || 'Thanh toán thành công qua VNPay');
        setShowFinalState(true);
        
        // Auto redirect after showing success
        setTimeout(() => {
          navigate('/purchase-history');
        }, 4000);
        return;
      } else if (statusFromQuery === 'failed') {
        setStatus('FAILED');
        setMessage(messageFromQuery || 'Thanh toán thất bại');
        setShowFinalState(true);
        
        // Auto redirect after showing failure
        setTimeout(() => {
          navigate('/cart');
        }, 4000);
        return;
      } else if (statusFromQuery === 'processing') {
        setStatus('PENDING');
        setMessage(messageFromQuery || 'Đang xử lý thanh toán...');
        // Continue with normal processing flow
      }
    }

    // Check if we have direct result from VNPayReturnPage
    const stateData = location.state as any;
    if (stateData?.isSuccess !== undefined) {
      // Direct result from VNPay return page
      if (stateData.isSuccess) {
        setStatus('SUCCESS');
        setOrderId(stateData.orderId || '');
        setMessage('Thanh toán thành công qua VNPay');
        setShowFinalState(true);
        
        // Auto redirect after showing success
        setTimeout(() => {
          navigate('/purchase-history');
        }, 4000);
      } else {
        setStatus('FAILED');
        setMessage(stateData.message || 'Thanh toán thất bại');
        setShowFinalState(true);
        
        // Auto redirect after showing failure
        setTimeout(() => {
          navigate('/cart');
        }, 4000);
      }
      return;
    }

    const transactionId = searchParams.get('transactionId') || searchParams.get('vnp_TxnRef');
    
    if (!transactionId) {
      // Redirect to home if no transaction ID
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Check payment status in background
    const checkStatus = async () => {
      try {
        const response = await checkPaymentStatus(transactionId);
        
        if (!response.exists) {
          setStatus('PENDING');
          setMessage(response.message || '');
        } else {
          setStatus(response.status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED');
          setMessage(response.message || '');
          setOrderId(response.orderId?.toString() || '');
          
          // Show final state for SUCCESS or FAILED
          if (response.status === 'SUCCESS' || response.status === 'FAILED' || response.status === 'EXPIRED') {
            setShowFinalState(true);
            
            // Auto redirect based on status after showing final state
            setTimeout(() => {
              if (response.status === 'SUCCESS') {
                navigate('/purchase-history');
              } else {
                navigate('/cart');
              }
            }, 4000);
          }
        }
      } catch (error: any) {
        setStatus('FAILED');
        setMessage(error.message || 'Lỗi kiểm tra trạng thái thanh toán');
        setShowFinalState(true);
        setTimeout(() => navigate('/cart'), 3000);
      }
    };

    checkStatus();

    // Poll for status updates if payment is still pending
    const interval = setInterval(async () => {
      if (status !== 'PENDING') {
        clearInterval(interval);
        return;
      }
      
      try {
        const response = await checkPaymentStatus(transactionId);
        
        if (!response.exists) {
          setStatus('PENDING');
          setMessage(response.message || '');
        } else {
          setStatus(response.status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED');
          setMessage(response.message || '');
          setOrderId(response.orderId?.toString() || '');
          
          if (response.status !== 'PENDING') {
            clearInterval(interval);
            setShowFinalState(true);
            
            // Auto redirect based on status
            setTimeout(() => {
              if (response.status === 'SUCCESS') {
                navigate('/purchase-history');
              } else {
                navigate('/cart');
              }
            }, 4000);
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000);

    // Clear interval after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      // Redirect to cart if still processing after 10 minutes
      if (status === 'PENDING' || status === null) {
        navigate('/cart');
      }
    }, 600000);

    return () => clearInterval(interval);
  }, [searchParams, status, navigate, location.state]);

  // Show SUCCESS state
  if (showFinalState && status === 'SUCCESS') {
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
          <p className="text-gray-600 mb-4">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
          
          {orderId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-800">
                <span className="font-medium">Mã đơn hàng:</span> 
                <span className="font-bold ml-1">#{orderId}</span>
              </p>
            </div>
          )}
          
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
              🏠 Về trang chủ
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Tự động chuyển đến lịch sử mua hàng trong 4 giây...
          </p>
        </div>
      </div>
    );
  }

  // Show FAILED/EXPIRED state
  if (showFinalState && (status === 'FAILED' || status === 'EXPIRED')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          {/* Failed Animation */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {status === 'EXPIRED' ? '⏰ Thanh toán đã hết hạn' : '❌ Thanh toán thất bại'}
          </h1>
          <p className="text-gray-600 mb-4">
            {message || (status === 'EXPIRED' 
              ? 'Phiên thanh toán đã hết hạn. Vui lòng thử lại.' 
              : 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.')}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <span className="font-medium">Lý do:</span> 
              <span className="ml-1">{status === 'EXPIRED' ? 'Hết thời gian thanh toán' : 'Giao dịch không thành công'}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              🛒 Quay lại giỏ hàng
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              🏠 Về trang chủ
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Tự động quay lại giỏ hàng trong 4 giây...
          </p>
        </div>
      </div>
    );
  }

  // Show PENDING/PROCESSING state (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        {/* Processing Animation */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💳 Đang xử lý thanh toán...</h1>
        <p className="text-gray-600 mb-6">
          {message || 'Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn từ VNPay...'}
        </p>
        
        {/* Enhanced Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
        
        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-sm text-blue-800 font-medium">Đang kiểm tra trạng thái thanh toán...</span>
          </div>
          <p className="text-xs text-blue-600 mt-2">Kiểm tra mỗi 3 giây</p>
        </div>
        
        {/* Progress Steps */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>✅ Đã gửi yêu cầu thanh toán</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>✅ Đã xác thực thông tin từ VNPay</span>
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span>⏳ Đang xác nhận kết quả thanh toán...</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            🏠 Về trang chủ
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          💡 Quá trình này thường mất 5-30 giây
        </p>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;