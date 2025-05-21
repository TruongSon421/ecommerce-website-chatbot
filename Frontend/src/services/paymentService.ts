import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/payment'; // Updated to match the payment-service URL

interface PaymentIntentRequest {
  amount: number; // Amount in smallest currency unit (e.g., cents)
  currency: string;
  transactionId: string; // Your internal transaction ID from checkout initiation
  // Add any other necessary fields
}

interface PaymentIntentResponse {
  clientSecret: string;
  // Add other fields returned by your backend (e.g., paymentIntentId)
}

interface ConfirmPaymentRequest {
  transactionId: string;
  paymentGatewayId: string; // e.g., Stripe Payment Intent ID
  // Add any other necessary fields
}

interface ConfirmPaymentResponse {
  success: boolean;
  orderId?: string; // The final order ID after successful payment
  message?: string;
}

// Request to your backend to initiate VNPay payment
export interface InitiateVNPayPaymentRequest {
  transactionId: string; // Your internal transaction ID
  amount: number; // Total order amount
  orderInfo: string; // Description of the order, e.g., "Payment for order [transactionId]"
  orderId: string; // Your internal order ID
  paymentMethod?: string; // Optional: Payment method (e.g., VNPAYQR, VNBANK, INTCARD)
  bankCode?: string; // Optional: If specific bank is chosen
}

// Response from your backend after initiating VNPay payment
export interface InitiateVNPayPaymentResponse {
  paymentUrl: string; // The VNPay URL to redirect the user to
}

// Request to your backend to confirm/verify VNPay payment after user returns from VNPay
// This will contain all query parameters VNPay appends to your return URL
export interface ConfirmVNPayPaymentRequest {
  [key: string]: string | number | undefined | null; // To capture all vnp_ parameters
}

// Response from your backend after confirming VNPay payment
export interface ConfirmVNPayPaymentResponse {
  success: boolean;
  orderId?: string; // The final order ID after successful payment confirmation
  message?: string;
  paymentStatus?: string; // 'SUCCESS', 'PROCESSING', 'FAILED', 'ERROR'
  status?: string; // For backward compatibility
}

// Response for checking payment status
export interface PaymentStatusResponse {
  orderId: string;
  status: string; // 'SUCCESS', 'PROCESSING', 'FAILED', 'PENDING', 'EXPIRED'
  message?: string;
  paymentId?: string;
  amount?: string;
  paymentMethod?: string;
  transactionTime?: string;
}

/**
 * Creates a payment intent with the backend (e.g., for Stripe).
 * This typically happens on the PaymentPage before rendering the Stripe Elements form.
 */
export const createPaymentIntent = async (data: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
  try {
    // const response = await axios.post<PaymentIntentResponse>(`${API_BASE_URL}/create-payment-intent`, data);
    // return response.data;

    // Mock implementation
    console.log('Mock createPaymentIntent called with:', data);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    if (data.amount <= 0) {
      throw new Error('Amount must be positive.');
    }
    return {
      clientSecret: `pi_mock_${Date.now()}_secret_for_${data.transactionId}`,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

/**
 * Confirms the payment with the backend after successful processing by the payment gateway on the client-side.
 */
export const confirmBackendPayment = async (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
  try {
    // const response = await axios.post<ConfirmPaymentResponse>(`${API_BASE_URL}/confirm-payment`, data);
    // return response.data;

    // Mock implementation
    console.log('Mock confirmBackendPayment called with:', data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    if (!data.paymentGatewayId) {
      throw new Error('Payment gateway ID is missing.');
    }
    return {
      success: true,
      orderId: `order_mock_${Date.now()}`,
      message: 'Payment confirmed successfully.',
    };
  } catch (error) {
    console.error('Error confirming payment on backend:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};

/**
 * Calls your backend to get a VNPay payment URL.
 */
export const initiateVNPayPayment = async (data: InitiateVNPayPaymentRequest): Promise<InitiateVNPayPaymentResponse> => {
  try {
    const response = await axios.post<InitiateVNPayPaymentResponse>(`${API_BASE_URL}/vnpay/create-payment`, data);
    return response.data;
  } catch (error) {
    console.error('Error initiating VNPay payment:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to initiate VNPay payment: ${error.response.data.message || error.message}`);
    }
    throw new Error('An unexpected error occurred while initiating VNPay payment.');
  }
};

/**
 * Sends VNPay return parameters to your backend for verification and order finalization.
 * VNPay typically redirects to this URL using GET method.
 */
export const confirmVNPayPayment = async (vnpayParams: ConfirmVNPayPaymentRequest): Promise<ConfirmVNPayPaymentResponse> => {
  try {
    // VNPay return is usually a GET request. We append query params to the URL.
    // Your backend endpoint /vnpay/return should be a GET endpoint that expects these params.
    const response = await axios.get<ConfirmVNPayPaymentResponse>(`${API_BASE_URL}/vnpay/return`, {
      params: vnpayParams 
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming VNPay payment:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to confirm VNPay payment: ${error.response.data.message || error.message}`);
    }
    throw new Error('An unexpected error occurred while confirming VNPay payment.');
  }
};

/**
 * Checks the current status of a payment by orderId.
 * Used for polling payment status after redirect from VNPay.
 */
export const checkPaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  try {
    const response = await axios.get<PaymentStatusResponse>(`${API_BASE_URL}/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to check payment status: ${error.response.data.message || error.message}`);
    }
    throw new Error('An unexpected error occurred while checking payment status.');
  }
}; 