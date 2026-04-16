import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, Component } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import UserProtectedRoute from "./components/UserProtectedRoute";
import { LoadingProvider } from "./context/LoadingContext";
import { ToastProvider } from "./context/ToastContext";
import Loader from "./components/Loader";

// Lazy-loaded pages
const Login        = React.lazy(() => import("./pages/Login"));
const Dashboard    = React.lazy(() => import("./pages/Dashboard"));
const Services     = React.lazy(() => import("./pages/Services"));
const Products     = React.lazy(() => import("./pages/Products"));
const Bookings     = React.lazy(() => import("./pages/Bookings"));
const Settings     = React.lazy(() => import("./pages/Settings"));
const Home         = React.lazy(() => import("./pages/user/Home"));
const Ulogin       = React.lazy(() => import("./pages/user/Ulogin"));
const Register     = React.lazy(() => import("./pages/user/Register"));
const UserServices = React.lazy(() => import("./pages/user/UserServices"));
const UserStore    = React.lazy(() => import("./pages/user/UserStore"));
const UserDashboard= React.lazy(() => import("./pages/user/UserDashboard"));
const UserBookings = React.lazy(() => import("./pages/user/UserBookings"));

// Error Boundary — catches React render errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("App Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white p-6">
          <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-3xl flex items-center justify-center mb-6 text-3xl">⚠️</div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Something went wrong</h1>
          <p className="text-zinc-500 text-sm mb-8 text-center max-w-sm">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
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
                    <Route path="/admin/settings" element={<Settings />} />
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

                {/* 404 fallback */}
                <Route path="*" element={
                  <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                    <p className="text-8xl font-black text-red-600 italic">404</p>
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-xs mt-4">Page not found</p>
                    <button onClick={() => window.location.href='/'} className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all">
                      Go Home
                    </button>
                  </div>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LoadingProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
