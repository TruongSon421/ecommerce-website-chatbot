import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrderDetailsByTransactionId, OrderDetailsResponse } from '../services/orderService';
import { processPayment, ProcessPaymentRequest } from '../services/paymentService';
import OrderSummary from '../components/payment/OrderSummary';
// import PaymentForm from '../components/payment/PaymentForm'; // No longer directly used for VNPay redirect

const PaymentPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    if (!transactionId) {
      setError('Transaction ID is missing.');
      setIsLoading(false);
      return;
    }

    const getOrderDetails = async () => {
      try {
        setIsLoading(true);
        const details = await fetchOrderDetailsByTransactionId(transactionId);
        setOrderDetails(details);
        setError(null);
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching order details.');
      } finally {
        setIsLoading(false);
      }
    };

    getOrderDetails();
  }, [transactionId]);

  const handlePayWithVNPay = async () => {
    if (!orderDetails || !transactionId) {
      setError('Order details are not loaded or transaction ID is missing.');
      return;
    }
    setIsRedirecting(true);
    setError(null);
    try {
      const paymentRequest: ProcessPaymentRequest = {
        orderId: Number(orderDetails.id),
        userId: orderDetails.userId || 'anonymous', // You might need to get this from auth context
        paymentMethod: 'CREDIT_CARD', // Default to credit card, you can add UI to let user choose
        totalAmount: orderDetails.totalAmount,
      };
      
      const response = await processPayment(paymentRequest);
      if (response.paymentUrl) {
        // Redirect the user to VNPay's payment gateway
        window.location.href = response.paymentUrl;
      } else {
        setError('Failed to get VNPay payment URL. Please try again.');
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error('Error processing VNPay payment:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during VNPay processing.');
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading order details...</div>;
  }

  if (error && !isRedirecting) { // Don't show main page error if we are in redirect process
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  if (!orderDetails && !isLoading) {
    return <div className="container mx-auto p-4 text-center">Order details not found.</div>;
  }

  if (isRedirecting) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to VNPay...</h1>
        <p>Please wait while we securely transfer you to the VNPay payment gateway.</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h1>
      {orderDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <OrderSummary orderDetails={orderDetails} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <img src="/images/vnpay_logo.png" alt="VNPay Logo" className="h-16 mb-6" /> {/* Add VNPay logo to public/images */}
            <p className="text-gray-700 mb-6 text-center">
              You will be redirected to the VNPay gateway to complete your payment securely.
            </p>
            <button 
              onClick={handlePayWithVNPay}
              disabled={isRedirecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
            >
              {isRedirecting ? 'Processing...' : 'Pay with VNPay'}
            </button>
            {error && isRedirecting && (
              <p className="text-red-500 text-sm mt-4">Error: {error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage; 