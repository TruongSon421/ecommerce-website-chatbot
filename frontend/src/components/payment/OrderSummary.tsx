import React from 'react';
import { OrderDetailsResponse, OrderItem } from '../../services/orderService';

interface OrderSummaryProps {
  orderDetails: OrderDetailsResponse;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ orderDetails }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="mb-4">
        <h3 className="font-medium">Transaction ID:</h3>
        <p className="text-sm text-gray-600 mb-2">{orderDetails.transactionId}</p>
        <h3 className="font-medium">Items:</h3>
        <ul className="list-disc list-inside ml-4">
          {orderDetails.items.map((item: OrderItem) => (
            <li key={item.productId} className="mb-1">
              {item.name} (x{item.quantity}) - {orderDetails.totalAmount / item.quantity * item.price /100000} VND each
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-2">
        <span className="font-medium">Shipping Address:</span> {orderDetails.shippingAddress}
      </div>
      <div className="mb-4">
        <span className="font-medium">Payment Method:</span> {orderDetails.paymentMethod} (Proceeding with VNPay)
      </div>
      <hr className="my-4" />
      <div className="text-lg font-bold flex justify-between">
        <span>Total Amount:</span>
        <span>{orderDetails.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
      </div>
    </div>
  );
};

export default OrderSummary; 