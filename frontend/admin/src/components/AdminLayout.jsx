import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      
      {/* LEFT SIDE → SIDEBAR */}
      <Sidebar />

      {/* RIGHT SIDE → PAGE CONTENT */}
      <div className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </div>

    </div>
  );
};

export default AdminLayout;
