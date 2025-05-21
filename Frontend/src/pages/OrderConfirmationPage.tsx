import React from 'react';
import { Link, useParams } from 'react-router-dom';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="container mx-auto p-8 text-center">
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-4">Cảm ơn bạn!</h1>
        <p className="text-lg mb-2">Đơn hàng của bạn đã được đặt thành công.</p>
        <p className="mb-4">
          Mã đơn hàng của bạn là: <span className="font-semibold">{orderId || 'N/A'}</span>
        </p>
        <p className="mb-6">
          Chúng tôi đã nhận được thanh toán và đơn hàng của bạn đang được xử lý. 
          Bạn sẽ nhận được email xác nhận trong thời gian ngắn với chi tiết đơn hàng và thông tin theo dõi khi đơn hàng được gửi đi.
        </p>
        <Link 
          to="/" // Link to homepage or user's order history page
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-150 ease-in-out"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 