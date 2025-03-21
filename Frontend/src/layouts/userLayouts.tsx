import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import ChatWidget from "../components/chatbotWidget";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <ChatWidget />
      <Footer />
    </>
  );
};

export default UserLayout;
