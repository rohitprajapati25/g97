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

// export default api;



import axios from "axios";

const api = axios.create({
  //  baseURL = `import.meta.env.VITE_API_BASE_URL`,

  // baseURL: "http://localhost:5000/api",
  baseURL: 'https://g97.onrender.com/api',
  headers: {
    "Content-Type": "application/json",
  },
});

// Ye function hum App.jsx mein call karenge loader set karne ke liye
export const attachLoader = (setLoading) => {
  
  // 1. Request Interceptor (Chalu karne ke liye)
  api.interceptors.request.use(
    (config) => {
      // Loader ON karein
      if (setLoading) setLoading(true);

      const userToken = localStorage.getItem("userToken");
      const adminToken = localStorage.getItem("adminToken");
      const token = userToken || adminToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      if (setLoading) setLoading(false);
      return Promise.reject(error);
    }
  );

  // 2. Response Interceptor (Band karne ke liye)
  api.interceptors.response.use(
    (response) => {
      // Request successful, Loader OFF karein
      if (setLoading) setLoading(false);
      return response;
    },
    (error) => {
      // Request failed, Loader OFF karein tab bhi
      if (setLoading) setLoading(false);
      return Promise.reject(error);
    }
  );
};

export default api;