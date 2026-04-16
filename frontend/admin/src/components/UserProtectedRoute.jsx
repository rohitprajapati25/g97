import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { checkTokenExpiry, useAutoLogout } from '../utils/auth';

const UserProtectedRoute = () => {
  const [isValid, setIsValid] = useState(null);
  const location = useLocation();
  useAutoLogout();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token || !checkTokenExpiry('userToken')) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, []);

  // Loading state
  if (isValid === null) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Verifying session...</p>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
