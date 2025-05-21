import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmVNPayPayment, ConfirmVNPayPaymentRequest } from '../services/paymentService';

const VNPayReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processVNPayReturn = async () => {
      const queryParams = new URLSearchParams(location.search);
      // Create an object to collect all parameters
      const vnpayParams: ConfirmVNPayPaymentRequest = {};
      
      // Extract all parameters from query string, especially those starting with vnp_
      queryParams.forEach((value, key) => {
        vnpayParams[key] = value;
      });

      if (Object.keys(vnpayParams).length === 0) {
        setError('Không tìm thấy thông tin thanh toán VNPay trong URL.');
        setIsLoading(false);
        return;
      }
      
      try {
        // No need to call our backend for confirmation as that's handled automatically
        // by the VnpayController's /return endpoint which redirects user here with
        // appropriate parameters

        // Check for orderId and status in URL params
        const orderId = queryParams.get('orderId');
        const status = queryParams.get('status');
        const message = queryParams.get('message');

        if (!orderId) {
          setError('Thiếu thông tin đơn hàng. Vui lòng liên hệ hỗ trợ.');
          setIsLoading(false);
          return;
        }

        // Navigate based on status
        if (status === 'success') {
          navigate(`/order-confirmation/${orderId}`);
        } else if (status === 'processing') {
          navigate(`/payment-processing/${orderId}?status=processing&message=${message || ''}`);
        } else {
          // Handle failed payment
          const errorParams = new URLSearchParams({
            orderId: orderId,
            message: message || 'Thanh toán không thành công',
          });
          navigate(`/payment-failed?${errorParams.toString()}`);
        }
      } catch (err) {
        console.error('Error processing VNPay return:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xử lý kết quả thanh toán.');
        setIsLoading(false);
      }
    };

    processVNPayReturn();
  }, [location, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6">Đang xác nhận thanh toán</h1>
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
          <p className="text-gray-600">Vui lòng đợi trong khi chúng tôi xác nhận thanh toán của bạn.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-6">✕</div>
          <h1 className="text-2xl font-bold mb-4">Xác nhận thanh toán thất bại</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
            >
              Quay về trang chủ
            </button>
            <button 
              onClick={() => navigate('/my-orders')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-md"
            >
              Kiểm tra đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here as we navigate away on success
  return null;
};

export default VNPayReturnPage; 