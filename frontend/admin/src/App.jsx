import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import UserProtectedRoute from "./components/UserProtectedRoute";
import { LoadingProvider } from "./context/LoadingContext";
import Loader from "./components/Loader";

// lazy-loaded pages to reduce bundle size
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Services = React.lazy(() => import("./pages/Services"));
const Products = React.lazy(() => import("./pages/Products"));
const Bookings = React.lazy(() => import("./pages/Bookings"));
const Home = React.lazy(() => import("./pages/user/Home"));
const Ulogin = React.lazy(() => import("./pages/user/Ulogin"));
const Register = React.lazy(() => import("./pages/user/Register"));
const UserServices = React.lazy(() => import("./pages/user/UserServices"));
const UserStore = React.lazy(() => import("./pages/user/UserStore"));
const UserDashboard = React.lazy(() => import("./pages/user/UserDashboard"));
const UserBookings = React.lazy(() => import("./pages/user/UserBookings"));

function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
          {/* PUBLIC PAGES */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<UserServices />} />
          <Route path="/store" element={<UserStore />} />

          {/* ADMIN LOGIN */}
          <Route path="/Login" element={<Login />} />

          {/* PROTECTED ADMIN ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/services" element={<Services />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/bookings" element={<Bookings />} />
            </Route>
          </Route>

          {/* USER AUTH */}
          <Route path="/user/login" element={<Ulogin />} />
          <Route path="/user/register" element={<Register />} />

          {/* USER PROTECTED ROUTES */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/bookings" element={<UserBookings />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;
