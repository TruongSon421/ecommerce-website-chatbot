import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { checkPaymentStatus } from '../services/paymentService';

const PaymentProcessingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const maxChecks = 10; // Maximum number of status checks (30 seconds with 3s interval)
  
  // Get status from query params if available
  const queryParams = new URLSearchParams(location.search);
  const statusFromParams = queryParams.get('status');
  const messageFromParams = queryParams.get('message');

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing.');
      setIsLoading(false);
      return;
    }

    // If we already have a final status from params, don't poll
    if (statusFromParams && (statusFromParams === 'success' || statusFromParams === 'failed')) {
      handleFinalStatus(statusFromParams);
      return;
    }

    const checkInterval = setInterval(() => {
      checkPaymentStatusFromBackend();
      setCheckCount(prevCount => prevCount + 1);
    }, 3000); // Check every 3 seconds

    return () => clearInterval(checkInterval);
  }, [orderId, checkCount, statusFromParams]);

  // Check if we've reached max checks
  useEffect(() => {
    if (checkCount >= maxChecks) {
      setError('Quá thời gian xử lý thanh toán. Vui lòng kiểm tra trạng thái đơn hàng trong trang cá nhân.');
      setIsLoading(false);
    }
  }, [checkCount]);

  const checkPaymentStatusFromBackend = async () => {
    if (!orderId || checkCount >= maxChecks) return;

    try {
      const response = await checkPaymentStatus(orderId);
      
      // Convert status to uppercase to match backend values
      const status = response.status.toUpperCase();
      
      if (status === 'SUCCESS') {
        handleFinalStatus('success');
      } else if (status === 'FAILED' || status === 'EXPIRED') {
        handleFinalStatus('failed', response.message);
      }
      // If status is still PROCESSING or PENDING, continue polling
    } catch (err) {
      console.error('Error checking payment status:', err);
      // Don't set error yet, continue polling
    }
  };

  const handleFinalStatus = (status: string, message?: string) => {
    if (status.toLowerCase() === 'success') {
      navigate(`/order-confirmation/${orderId}`);
    } else if (status.toLowerCase() === 'failed') {
      const params = new URLSearchParams({
        orderId: orderId || '',
        message: message || 'Thanh toán không thành công hoặc đã bị hủy.'
      });
      navigate(`/payment-failed?${params.toString()}`);
    }
  };

  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Đang xử lý thanh toán</h1>
        
        {isLoading ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
            <p className="text-gray-600 mb-2">
              Thanh toán của bạn đang được xử lý. Vui lòng không đóng trang này.
            </p>
            <p className="text-gray-500 text-sm">
              Quá trình này có thể mất vài phút. Hệ thống đang chờ xác nhận từ cổng thanh toán VNPay.
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 mb-6">
              Bạn có thể kiểm tra trạng thái đơn hàng trong phần "Đơn hàng của tôi".
            </p>
            <button
              onClick={() => navigate('/my-orders')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
            >
              Xem đơn hàng
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentProcessingPage; 