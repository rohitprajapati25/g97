import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let activityTimer;

    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(() => {
        // Auto logout after 5 minutes inactivity
        localStorage.removeItem('userToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/user/login', { replace: true });
        alert('Session expired. Please login again.');
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Listen for all user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity); 
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    resetTimer(); // Start timer

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(activityTimer);
    };
  }, [navigate]);
};

export const checkTokenExpiry = () => {
  const userToken = localStorage.getItem('userToken');
  const adminToken = localStorage.getItem('adminToken');
  
  if (userToken || adminToken) {
    try {
      // Decode JWT to check expiry (client-side)
      const payload = JSON.parse(atob((userToken || adminToken).split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        return false;
      }
    } catch {
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      return false;
    }
  }
  return true;
};


