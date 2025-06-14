// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index";
import { useGuestCart } from "./components/hooks/useGuestCart";
import { useAuth } from "./components/hooks/useAuth";
import { NotificationProvider } from './components/common/Notification.tsx';

// Import layouts
import UserLayout from "./layouts/userLayouts";
import AdminLayout from "./layouts/adminLayouts";

// Import public components
import Login from "./components/user/login";
import Register from "./components/user/register";
import Home from "./pages/home";
import PageCategory from "./pages/categories";
import PageCategoryAdmin from "./pages/admin/ProductManagement";

import ProductGH from "./pages/productDetail";
import ProductGHAdmin from "./pages/admin/productDetailAdmin";

import CartPage from "./pages/CartPage";

// Import admin components
import AdminLogin from "./pages/admin/LoginAdmin";
import AdminRegister from "./pages/admin/RegisterAdmin";
import Dashboard from "./pages/admin/adminDashBoard.tsx";
import AddProductPage from "./pages/admin/addProduct.tsx";
import ProductManagement from "./pages/admin/ProductManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ReviewManagement from "./pages/admin/ReviewManagement";
import TagManagement from "./pages/admin/TagManagement";
// Import private user components
import PaymentPage from "./pages/PaymentPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import VNPayReturnPage from "./pages/VNPayReturnPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import CheckoutPage from "./pages/CheckoutPage";
import Profile from "./components/user/profile";
import PurchaseHistory from "./components/user/PurchaseHistory";
import PoliciesPage from "./components/PopliciesPage.tsx";
// Private route components
const UserPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

function AppContent() {
   // Initialize guest cart functionality
  useGuestCart();
  return (
    <NotificationProvider>
      <Routes>
        {/* User routes with UserLayout */}
        <Route path="/" element={<UserLayout />}>
          
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="cart" element={<CartPage />} />
          <Route path=":type" element={<PageCategory />} />
          <Route path="/detail/:type/:product_id" element={<ProductGH />} />
          <Route path="/policies" element={<PoliciesPage />} />
          
          {/* Private user routes */}
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
            path="purchase-history"
            element={
              <UserPrivateRoute>
                <PurchaseHistory />
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

        {/* Admin routes with AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="login" element={<AdminLogin />} />
          <Route path="register" element={<AdminRegister />} />
          <Route path="dashboard" element={<AdminPrivateRoute><Dashboard /></AdminPrivateRoute>} />
          <Route path="product/add" element={<AdminPrivateRoute><AddProductPage /></AdminPrivateRoute>} />
          <Route path="products" element={<AdminPrivateRoute><ProductManagement /></AdminPrivateRoute>} />
          <Route path="products/:type" element={<AdminPrivateRoute><PageCategoryAdmin /></AdminPrivateRoute>} />
          <Route path="tag" element={<AdminPrivateRoute><TagManagement /></AdminPrivateRoute>} />

          <Route path="detail/:type/:product_id" element={<AdminPrivateRoute><ProductGHAdmin /></AdminPrivateRoute>} />
        
          <Route path="users" element={<AdminPrivateRoute><UserManagement /></AdminPrivateRoute>} />
          <Route path="orders" element={<AdminPrivateRoute><OrderManagement /></AdminPrivateRoute>} />
          <Route path="reviews" element={<AdminPrivateRoute><ReviewManagement /></AdminPrivateRoute>} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;