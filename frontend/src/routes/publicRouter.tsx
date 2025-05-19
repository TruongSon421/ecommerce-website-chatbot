import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../components/user/login";
import Register from "../components/user/register";
import Home from "../pages/home";
import PageCategory from "../pages/categories";
import ProductGH from "../pages/productDetail";
import UserLayout from "../layouts/userLayouts";
import Cart from '../components/Cart';
import Checkout from '../pages/Checkout';

const PublicRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route index element={<Home />} /> {/* Dùng index cho path="/" */}
        <Route path=":type" element={<PageCategory />} />
        <Route path=":type/:product_id" element={<ProductGH />} />
        <Route path="cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
    </Routes>
  );
};

export default PublicRouter;