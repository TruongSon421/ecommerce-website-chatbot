import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlices';
import productReducer from './slices/productSlices';
import cartReducer from './slices/cartSlice'; // Import cartReducer

const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer, // Thêm cart reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }), // Disable serializable check
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;