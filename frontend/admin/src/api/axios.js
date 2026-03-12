// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ✅ Automatically attach token to every request (user or admin)
// api.interceptors.request.use(
//   (config) => {
//     const userToken = localStorage.getItem("userToken");
//     const adminToken = localStorage.getItem("adminToken");
//     const token = userToken || adminToken;

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

import axios from "axios";

// Detect environment - use local for development, live for production
// Supports: localhost, 127.0.0.1, g97.rerender, g97.onrender.com
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal ? "http://localhost:5000/api" : "https://g97backend.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout to prevent hanging requests
});

// Request counter to track pending requests
let pendingRequests = 0;

export const attachLoader = (setLoading) => {
  // 1. Request Interceptor
  api.interceptors.request.use(
    (config) => {
      pendingRequests++;
      // Only show loader when there are actual pending requests
      if (pendingRequests === 1 && setLoading) {
        setLoading(true);
      }

      const userToken = localStorage.getItem("userToken");
      const adminToken = localStorage.getItem("adminToken");
      const token = userToken || adminToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      pendingRequests = Math.max(0, pendingRequests - 1);
      if (pendingRequests === 0 && setLoading) setLoading(false);
      return Promise.reject(error);
    }
  );

  // 2. Response Interceptor
  api.interceptors.response.use(
    (response) => {
      pendingRequests = Math.max(0, pendingRequests - 1);
      if (pendingRequests === 0 && setLoading) setLoading(false);
      return response;
    },
    (error) => {
      pendingRequests = Math.max(0, pendingRequests - 1);
      if (pendingRequests === 0 && setLoading) setLoading(false);
      return Promise.reject(error);
    }
  );
};

export default api;
