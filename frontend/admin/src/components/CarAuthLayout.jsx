import React from "react";
import logo from "../assets/T-Logo.png"; // 🔥 LOGO PATH


const CarAuthLayout = ({ children }) => {
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
      <div className="relative z-10 w-full max-w-md bg-white/95 
        backdrop-blur-lg rounded-2xl shadow-2xl p-8">

        {/* Logo  */}
         <div className="flex justify-center ">
                   <img
                     src={logo}
                     alt="G97 Logo"
                     className="h-[120px] object-contain"
                   />
        </div>
     

        <p className="text-center text-gray-500 mb-6">
          Book | Buy 
        </p>

        {children}
      </div>
    </div>
  );
};

export default CarAuthLayout;
