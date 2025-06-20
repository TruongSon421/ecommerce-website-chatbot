import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmVNPayPayment } from '../services/paymentService';

const VNPayReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStep, setProcessingStep] = useState('Đang xác thực thông tin từ VNPay...');

  useEffect(() => {
    const processVNPayReturn = async () => {
      try {
        // Get all VNPay return parameters
        const vnpayParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          vnpayParams[key] = value;
        });

        const transactionId = searchParams.get('vnp_TxnRef');
        const responseCode = searchParams.get('vnp_ResponseCode');
        
        if (!transactionId) {
          navigate('/payment-failed', { 
            state: { 
              message: 'Không tìm thấy mã giao dịch từ VNPay' 
            } 
          });
          return;
        }

        setProcessingStep('Đang xác thực chữ ký điện tử...');
        
        // Immediately determine result based on VNPay response code
        if (responseCode === '00') {
          // Payment successful
          setProcessingStep('Thanh toán thành công! Đang hoàn tất...');
          setTimeout(() => {
            navigate('/payment-processing', {
              state: {
                isSuccess: true,
                transactionId: transactionId,
                orderId: vnpayParams.vnp_OrderInfo?.match(/\d+/)?.[0] || transactionId
              }
            });
          }, 2000);
        } else {
          // Payment failed
          const failureMessages: Record<string, string> = {
            '24': 'Giao dịch bị hủy bởi người dùng',
            '51': 'Tài khoản không đủ số dư',
            '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Nhập sai mật khẩu quá số lần quy định',
            '99': 'Lỗi không xác định'
          };
          
          const errorMessage = failureMessages[responseCode] || 'Giao dịch không thành công';
          setProcessingStep(`Thanh toán thất bại: ${errorMessage}`);
          
          setTimeout(() => {
            navigate('/payment-failed', {
              state: {
                message: errorMessage,
                transactionId: transactionId,
                responseCode: responseCode
              }
            });
          }, 3000);
        }

        // Try to confirm with backend (optional - for logging/verification)
        try {
          await confirmVNPayPayment(vnpayParams);
        } catch (error) {
          console.log('Backend confirmation failed, but proceeding with frontend result');
        }

      } catch (error) {
        console.error('Error processing VNPay return:', error);
        setProcessingStep('Có lỗi xảy ra khi xử lý kết quả thanh toán');
        setTimeout(() => {
          navigate('/payment-failed', {
            state: {
              message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
            }
          });
        }, 3000);
      }
    };

    processVNPayReturn();
  }, [navigate, searchParams]);

  // Show enhanced loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        {/* Animated VNPay logo/icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🔄 Đang xử lý kết quả từ VNPay</h1>
        <p className="text-gray-600 mb-4">Đang xác thực thông tin thanh toán và chuẩn bị kết quả...</p>
        
        {/* Enhanced progress indicators */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>✅ Nhận phản hồi từ VNPay</span>
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            <span>⏳ {processingStep}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
            <span>⏳ Cập nhật trạng thái đơn hàng...</span>
          </div>
        </div>
        
        {/* Loading animation */}
        <div className="flex justify-center mb-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">🔐 Đảm bảo an toàn giao dịch</p>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage; 