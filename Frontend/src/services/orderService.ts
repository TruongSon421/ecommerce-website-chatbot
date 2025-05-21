import axios from 'axios';

// Assuming your order service is running at this base URL
// and can provide order details by transaction ID post-initiation
const API_BASE_URL = 'http://localhost:8070/api/orders'; // Ensure this is your actual order-service URL

export interface OrderItem { // Exporting for potential use elsewhere
  productId: string; // Changed from id to productId for clarity, adjust if needed
  name: string;
  quantity: number;
  price: number;
  // Add other item details like color, image, etc., as returned by your API
  // Example: color?: string; imageUrl?: string;
}

export interface OrderDetailsResponse {
  id: string; // This should be the final Order ID if available at this stage
  transactionId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string; // The method selected during checkout initiation
  status: string; // e.g., PENDING_PAYMENT, RESERVING
  // Add other fields like createdAt, etc., as returned by your API
  // Example: createdAt?: string;
}

/**
 * Fetches order details using the transaction ID.
 * This is useful for the PaymentPage to display what the user is paying for.
 */
export const fetchOrderDetailsByTransactionId = async (transactionId: string): Promise<OrderDetailsResponse> => {
  try {
    const response = await axios.get<OrderDetailsResponse>(`${API_BASE_URL}/transaction/${transactionId}`);
    // It's good practice to log or transform data if needed here
    // console.log('Fetched order details:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for transaction ${transactionId}:`, error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Order details not found for transaction ID: ${transactionId}. The backend responded with 404.`);
      }
      // Handle other specific error statuses or log more details
      throw new Error(`Failed to fetch order details: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching order details.');
  }
}; 