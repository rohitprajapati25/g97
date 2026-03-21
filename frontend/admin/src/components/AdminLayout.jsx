import { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar automatically when clicking a link (handled via the Sidebar's onClose prop)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close sidebar on window resize to prevent layout ghosting
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* 🏁 SINGLE SIDEBAR INSTANCE 
        It handles its own desktop (fixed) vs mobile (transform) states 
      */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 📱 MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-6">
        <h1 className="text-white font-black tracking-tighter uppercase italic text-base sm:text-lg md:text-xl lg:text-2xl">
          Auto<span className="text-red-600">Hub</span>
        </h1>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
        <div className="flex-1 p-4 md:p-8 lg:p-10 mt-16 lg:mt-0 overflow-x-hidden">
          {/* Content Wrapper for visual polish */}
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;