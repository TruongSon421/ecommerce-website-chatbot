import React from 'react';
import { useCart } from '../components/hooks/useCart';
import { formatCurrency } from '../components/utils/formatCurrency';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (productId: string, color: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId, color);
    } else {
      updateQuantity(productId, color, quantity);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-4">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.color}`}
                className="flex items-center justify-between border-b py-4"
              >
                <div>
                  <h2 className="text-lg font-semibold">{item.productName}</h2>
                  <p className="text-gray-600">Color: {item.color}</p>
                  <p className="text-gray-600">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productId, item.color, parseInt(e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => removeFromCart(item.productId, item.color)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <p className="text-xl font-bold">Total: {formatCurrency(totalPrice)}</p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;