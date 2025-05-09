import React from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      <main>
        <Outlet /> {/* Nơi hiển thị route con */}
      </main>
    </div>
  );
};

export default AdminLayout;
