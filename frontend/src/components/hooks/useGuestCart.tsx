import { useEffect } from 'react';
import { initializeGuestCart } from '../../services/cartService';
import { useAuth } from './useAuth';

/**
 * Custom hook to handle guest cart initialization
 * Creates a guest cart ID when the user is not authenticated
 */
export const useGuestCart = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const createGuestCartIfNeeded = async () => {
      // Only create a guest cart if the user is not authenticated
      if (!isAuthenticated) {
        try {
          await initializeGuestCart();
        } catch (error) {
          console.error('Failed to initialize guest cart:', error);
        }
      }
    };

    createGuestCartIfNeeded();
  }, [isAuthenticated]);
};

export default useGuestCart;