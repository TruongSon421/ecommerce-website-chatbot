// src/routes/privateRouter.tsx
import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/adminLayouts";
import UserLayout from "../layouts/userLayouts";
import { useAuth } from "../components/hooks/useAuth";
import AdminLogin from "../pages/admin/LoginAdmin";
import AdminRegister from "../pages/admin/RegisterAdmin";
import Dashboard from "../pages/dashbroad/adminDashBroad";
import AddProductPage from "../pages/product/addProduct";
import ProductManagement from "../pages/admin/ProductManagement";
import PaymentPage from "../pages/PaymentPage";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import VNPayReturnPage from "../pages/VNPayReturnPage";
import PaymentProcessingPage from "../pages/PaymentProcessingPage";
import PaymentFailedPage from "../pages/PaymentFailedPage";
import CheckoutPage from "../pages/CheckoutPage";
import Profile from "../components/user/profile";
const UserPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const PrivateRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        {/* Các route con cho user nếu có */}
        <Route 
          path="checkout"
          element={
            <UserPrivateRoute>
              <CheckoutPage />
            </UserPrivateRoute>
          }
        />
        <Route 
          path="profile"
          element={
            <UserPrivateRoute>
              <Profile />
            </UserPrivateRoute>
          }
        />
        <Route 
          path="payment/:transactionId"
          element={
            <UserPrivateRoute>
              <PaymentPage />
            </UserPrivateRoute>
          }
        />
        <Route 
          path="order-confirmation/:orderId"
          element={
            <UserPrivateRoute>
              <OrderConfirmationPage />
            </UserPrivateRoute>
          }
        />
        <Route 
          path="vnpay-return"
          element={
            <UserPrivateRoute>
              <VNPayReturnPage />
            </UserPrivateRoute>
          }
        />
        <Route 
          path="payment-processing/:orderId"
          element={
            <UserPrivateRoute>
              <PaymentProcessingPage />
            </UserPrivateRoute>
          }
        />
        <Route 
          path="payment-failed"
          element={
            <UserPrivateRoute>
              <PaymentFailedPage />
            </UserPrivateRoute>
          }
        />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route path="register" element={<AdminRegister />} />
        <Route
          path="dashboard"
          element={
            <AdminPrivateRoute>
              <Dashboard />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="product/add"
          element={
            <AdminPrivateRoute>
              <AddProductPage />
            </AdminPrivateRoute>
          }
        />

        <Route
          path="products"
          element={
            <AdminPrivateRoute>
              <ProductManagement />
            </AdminPrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default PrivateRouter;