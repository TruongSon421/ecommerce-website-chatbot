import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCartItems, createGuestCart, getGuestId, setGuestId } from '../../services/cartService';

export const useGuestCart = () => {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const initializeCart = async () => {
      if (!isAuthenticated) {
        // For guest users, create or get guestId and initialize cart
        try {
          let guestId = getGuestId();
          if (!guestId) {
            // Create new guest cart and get guestId
            const cartResponse = await createGuestCart();
            guestId = cartResponse.userId; // Backend returns cart with guestId as userId
            setGuestId(guestId);
            console.log('Created new guest cart with ID:', guestId);
          } else {
            // Try to load existing guest cart
            try {
              await getCartItems(guestId);
              console.log('Loaded existing guest cart for ID:', guestId);
            } catch (error) {
              // If guest cart doesn't exist, create new one
              console.log('Guest cart not found, creating new one');
              const cartResponse = await createGuestCart();
              guestId = cartResponse.userId;
              setGuestId(guestId);
              console.log('Created new guest cart with ID:', guestId);
            }
          }
        } catch (error) {
          console.error('Failed to initialize guest cart:', error);
        }
      } else if (user?.id) {
        // Load cart for authenticated users
        try {
          await getCartItems(user.id);
        } catch (error) {
          console.error('Failed to load user cart:', error);
        }
      }
    };

    initializeCart();
  }, [isAuthenticated, user?.id]);

  return null;
}; 