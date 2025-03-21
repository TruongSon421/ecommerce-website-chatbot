import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="admin-container">{children}</div>;
};

export default AdminLayout;
