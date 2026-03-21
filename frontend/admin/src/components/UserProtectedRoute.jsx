import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { checkTokenExpiry, useAutoLogout } from '../utils/auth';
import api from '../api/axios';

const UserProtectedRoute = () => {
  const [isValid, setIsValid] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  useAutoLogout();

  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem("userToken");
      if (!token || !checkTokenExpiry()) {
        localStorage.removeItem("userToken");
        setIsValid(false);
        setIsLoading(false);
        return;
      }
      
      // Trust client-side expiry check (industry standard)
      // Server verification happens per-request via axios interceptor
      setIsValid(true);
      setIsLoading(false);
    };

    validate();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>;
  }

  if (!isValid) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
