import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/layout/navbarAdmin";

const AdminLayout = () => {
  return (
    <div>
      <AdminNavbar />
      <main>
        <Outlet /> {/* Nơi hiển thị route con */}
      </main>
    </div>
  );
};

export default AdminLayout;
