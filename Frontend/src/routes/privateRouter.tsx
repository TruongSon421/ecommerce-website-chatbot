import React from "react";
import { Navigate, Route } from "react-router-dom";
import AdminLayout from "../layouts/adminLayouts";
import UserLayout from "../layouts/userLayouts";
import { useAuth } from "../components/hooks/useAuth";

const UserPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminPrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
};

export const privateRouter = [
  // Tuyến đường dành cho người dùng đã đăng nhập
  {
    path: "/",
    element: <UserLayout />,
    children: [
      // { path: "dashboard", element: <UserPrivateRoute><Dashboard /></UserPrivateRoute> },
      // { path: "cart", element: <UserPrivateRoute><Cart /></UserPrivateRoute> },
    ],
  },
  // Tuyến đường dành cho admin
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      // { path: "login", element: <AdminLogin /> },
      // { path: "register", element: <AdminRegister /> },
      // { path: "dashboard", element: <AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute> },
    ],
  },
];