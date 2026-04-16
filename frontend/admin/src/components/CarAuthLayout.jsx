import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { ArrowLeft } from "lucide-react";

const CarAuthLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md mx-4 sm:mx-auto bg-white/95
        backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8">

        {/* Back nav — top of card, left-aligned */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Auto Hub Logo"
            className="h-24 sm:h-[120px] object-contain"
          />
        </div>

        <p className="text-center text-gray-500 mb-6 text-xs sm:text-sm md:text-base">
          Book | Buy
        </p>

        {children}
      </div>
    </div>
  );
};

export default CarAuthLayout;
