import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { checkTokenExpiry, useAutoLogout } from '../utils/auth';
import api from '../api/axios';

const UserProtectedRoute = () => {
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();
  useAutoLogout();

  useEffect(() => {
    const validate = async () => {
      const token = localStorage.getItem("userToken");
      if (!token || !checkTokenExpiry()) {
        localStorage.removeItem("userToken");
        setIsValid(false);
        return;
      }

      try {
        await api.get('/user/profile');
        setIsValid(true);
      } catch {
        localStorage.removeItem("userToken");
        setIsValid(false);
      }
    };

    validate();
  }, []);

  if (!isValid) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
