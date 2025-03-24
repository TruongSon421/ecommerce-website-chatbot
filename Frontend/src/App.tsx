import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import PageCategory from "./pages/categories";
import ProductGH from "./pages/productDetail";
import Login from "./components/user/login";
import Register from "./components/user/register";
import { AuthProvider } from "./components/auth/authContexts";
import { AuthAdminProvider } from "./components/auth/authAdminContexts";
import AdminLogin from "./components/admin/loginAdmin";
import AdminRegister from "./components/admin/registerAdmin";
import AdminLayout from "./layouts/adminLayouts";
import UserLayout from "./layouts/userLayouts";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes cho user */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <UserLayout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/:type" element={<PageCategory />} />
                  <Route path="/phone/:phone_id" element={<ProductGH />} />
                </Routes>
              </UserLayout>
            </AuthProvider>
          }
        />

        {/* Routes cho admin */}
        <Route
          path="/trang-admin-dieu-khien/*"
          element={
            <AuthAdminProvider>
              <AdminLayout>
                <Routes>
                  <Route path="loginad" element={<AdminLogin />} />
                  <Route path="registerad" element={<AdminRegister />} />
                </Routes>
              </AdminLayout>
            </AuthAdminProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
