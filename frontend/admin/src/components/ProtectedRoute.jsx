import { Navigate, Outlet } from "react-router-dom";
import { checkTokenExpiry } from "../utils/auth";

const ProtectedRoute = () => {
  const token = localStorage.getItem("adminToken");

  // Must pass 'adminToken' key — default is 'userToken' which would always fail
  if (!token || !checkTokenExpiry('adminToken')) {
    localStorage.removeItem("adminToken");
    return <Navigate to="/Login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
