import React from "react";
import { Route, RouteObject } from "react-router-dom";
import Login from "../components/user/login";
import Register from "../components/user/register";
import Home from "../pages/home";
import PageCategory from "../pages/categories";
import ProductGH from "../pages/productDetail";
import UserLayout from "../layouts/userLayouts";

const publicRouter: RouteObject[] = [
  {
    path: "/",
    element: <UserLayout />, // Bọc layout cho các route con
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "/", element: <Home /> },
      { path: ":type", element: <PageCategory /> },
      { path: "phone/:phone_id", element: <ProductGH /> },
    ],
  },
];

export default publicRouter;