import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://localhost:5000/api" : "https://g97backend.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Track pending requests for loader
let pendingRequests = 0;

// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    pendingRequests++;
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");
    const token = userToken || adminToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 auto-logout + error toasts
api.interceptors.response.use(
  (response) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    return response;
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);

    const status = error.response?.status;
    const message = error.response?.data?.message;

    // 401 = token expired or invalid → redirect to correct login
    if (status === 401) {
      // Skip redirect for background/silent API calls
      const url = error.config?.url || '';
      const isSilentCall = url.includes('/notifications');
      if (isSilentCall) return Promise.reject(error);

      const isAdminPage = window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/bookings');

      if (isAdminPage) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        window.location.href = '/Login';
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        window.location.href = '/user/login';
      }
      return Promise.reject(error);
    }

    // Show error toast for all other errors (skip network/timeout)
    // Skip toast for background/silent calls
    const url = error.config?.url || '';
    const isSilentCall = url.includes('/notifications');

    if (!isSilentCall) {
      const statusCode = error.response?.status;
      const serverMsg  = error.response?.data?.message;

      if (statusCode === 500) {
        if (window.toast) window.toast('error', 'Server Error', serverMsg || 'Internal server error. Please try again.');
      } else if (statusCode === 404) {
        if (window.toast) window.toast('error', 'Not Found', serverMsg || 'The requested resource was not found.');
      } else if (statusCode === 403) {
        if (window.toast) window.toast('error', 'Access Denied', serverMsg || 'You do not have permission to do this.');
      } else if (statusCode === 400) {
        if (window.toast) window.toast('error', 'Invalid Request', serverMsg || 'Please check your input and try again.');
      } else if (serverMsg && window.toast) {
        window.toast('error', 'Error', serverMsg);
      } else if (error.code === 'ECONNABORTED' && window.toast) {
        window.toast('error', 'Request Timeout', 'The server took too long to respond. Please try again.');
      } else if (!error.response && window.toast) {
        window.toast('error', 'No Connection', 'Cannot reach the server. Check your internet connection.');
      }
    }

    return Promise.reject(error);
  }
);

// Optional: attach loader state from a component
export const attachLoader = (setLoading) => {
  api.interceptors.request.use((config) => {
    if (pendingRequests === 1 && setLoading) setLoading(true);
    return config;
  });
  api.interceptors.response.use(
    (res) => { if (pendingRequests === 0 && setLoading) setLoading(false); return res; },
    (err) => { if (pendingRequests === 0 && setLoading) setLoading(false); return Promise.reject(err); }
  );
};

export default api;
