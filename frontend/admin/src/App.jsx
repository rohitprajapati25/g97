import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Bookings from "./pages/Bookings";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/user/Home";
import Ulogin from "./pages/user/Ulogin";
import UserProtectedRoute from "./components/UserProtectedRoute";
import Register from "./pages/user/Register";
import UserServices from "./pages/user/UserServices";
import UserStore from "./pages/user/UserStore";
import UserDashboard from "./pages/user/UserDashboard";
import UserBookings from "./pages/user/UserBookings";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { attachLoader } from "./api/axios";


function App() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Axios ko loading state control karne ki power de di
    attachLoader(setLoading);
  }, []);
  return (
    <>
    <BrowserRouter>
      {loading && <Loader />}
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
    </BrowserRouter>
    </>
  );
}

export default App;
