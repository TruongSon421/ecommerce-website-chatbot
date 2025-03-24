import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlices';
import productReducer from './slices/productSlices';
const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }), // Disable serializable check
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;