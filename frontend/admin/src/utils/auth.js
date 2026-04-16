import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Check if a specific token is valid and not expired
export const checkTokenExpiry = (tokenKey = 'userToken') => {
  const token = localStorage.getItem(tokenKey);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(tokenKey);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(tokenKey);
    return false;
  }
};

// Clear all user session data
export const clearUserSession = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhone');
};

// Clear admin session data only
export const clearAdminSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
};

// Auto logout on inactivity (5 min) - only for user protected pages
export const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let activityTimer;

    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        clearUserSession();
        navigate('/user/login', { replace: true });
        if (window.toast) {
          window.toast('warning', 'Session Expired', 'Please login again');
        }
      }, 30 * 60 * 1000); // 30 minutes inactivity
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(activityTimer);
    };
  }, [navigate]);
};
