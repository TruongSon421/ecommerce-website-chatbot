import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { getCartItems, createGuestCart, getGuestId, setGuestId } from '../../services/cartService';

export const useGuestCart = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Skip cart initialization for admin users or admin routes
    if (isAdmin || location.pathname.startsWith('/admin')) {
      console.log('Skipping cart initialization for admin user or admin route');
      return;
    }

    const initializeCart = async () => {
      if (!isAuthenticated) {
        // For guest users, create or get guestId and initialize cart
        try {
          let guestId = getGuestId();
          if (!guestId) {
            // Create new guest cart and get guestId
            console.log('Creating new guest cart...');
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
      } else if (user?.id && !isAdmin) {
        // Load cart for authenticated non-admin users only
        try {
          await getCartItems(user.id);
          console.log('Loaded cart for authenticated user:', user.id);
        } catch (error) {
          console.error('Failed to load user cart:', error);
        }
      }
    };

    initializeCart();
  }, [isAuthenticated, user?.id, isAdmin, location.pathname]);

  return null;
};