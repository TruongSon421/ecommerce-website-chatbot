import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPaymentStatus } from '../services/paymentService';

const PaymentProcessingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | null>(null);
  const [message, setMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
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
          
          // Auto redirect based on status after processing
          if (response.status === 'SUCCESS') {
            setTimeout(() => navigate('/orders'), 3000);
          } else if (response.status === 'FAILED' || response.status === 'EXPIRED') {
            setTimeout(() => navigate('/cart'), 3000);
          }
        }
      } catch (error: any) {
        setStatus('FAILED');
        setMessage(error.message || 'Lỗi kiểm tra trạng thái thanh toán');
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
            
            // Auto redirect based on status
            if (response.status === 'SUCCESS') {
              setTimeout(() => navigate('/orders'), 2000);
            } else if (response.status === 'FAILED' || response.status === 'EXPIRED') {
              setTimeout(() => navigate('/cart'), 2000);
            }
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
  }, [searchParams, status, navigate]);

  // Always show the same processing message regardless of status
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tiến hành thanh toán</h1>
        <p className="text-gray-600">Vui lòng đợi trong khi chúng tôi xử lý thanh toán của bạn...</p>
        
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;