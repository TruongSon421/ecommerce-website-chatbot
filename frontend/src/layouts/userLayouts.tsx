import React from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import ChatWidget from "../components/chatbotWidget";
import { Outlet } from "react-router-dom";
import useGuestCart from '../components/hooks/useGuestCart';

const UserLayout = () => {
  useGuestCart();
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> {/* Nơi các component con sẽ hiển thị */}
      </main>
     <ChatWidget />
      <Footer />
    </div>
  );
};


export default UserLayout;
