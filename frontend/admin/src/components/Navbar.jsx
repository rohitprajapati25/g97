import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { User, LogOut, LayoutDashboard, Calendar, ChevronDown, LogIn, ShieldCheck } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("userToken");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  const [showProfile, setShowProfile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
        scrolled 
          ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl" 
          : "bg-transparent py-5 sm:py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* --- LOGO SECTION --- */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer group relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-blue-600/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
          
          <img 
            src={logo} 
            alt="Auto Hub" 
            className="relative h-8 sm:h-12 lg:h-14 w-auto object-contain transform transition duration-500 group-hover:scale-105" 
          />
        </div>

        {/* --- ACTIONS SECTION --- */}
        <div className="flex items-center gap-3 sm:gap-6">
          {!userToken && (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/user/login"
                className="text-zinc-400 hover:text-white px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <LogIn size={14} className="sm:hidden" />
                <span className="hidden sm:block">Sign In</span>
              </Link>
              
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all active:scale-95"
              >
                <ShieldCheck size={14} />
                <span className="hidden xs:block">Admin</span>
              </Link>
            </div>
          )}

          {userToken && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 pr-2 sm:pr-4 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-red-600/40 hover:bg-zinc-800 transition-all duration-300 group shadow-lg"
              >
                {/* Profile Avatar with Logo Color Scheme */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-blue-800 flex items-center justify-center text-white text-[10px] sm:text-xs font-black shadow-lg ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
                  {getInitials(userName)}
                </div>
                
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-zinc-200 text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                    {userName?.split(' ')[0] || "Member"}
                  </span>
                  <span className="text-zinc-500 text-[8px] font-bold uppercase tracking-tighter">Gold Member</span>
                </div>

                <ChevronDown 
                  size={14} 
                  className={`text-zinc-500 transition-transform duration-500 ${showProfile ? "rotate-180 text-red-500" : ""}`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {showProfile && (
                <div className="absolute right-0 mt-3 w-56 sm:w-64 origin-top-right rounded-[1.5rem] sm:rounded-[2rem] bg-[#0c0c0c] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
                  {/* User Info Section */}
                  <div className="px-6 py-5 bg-gradient-to-br from-red-600/10 to-transparent border-b border-white/5">
                    <p className="text-white font-black text-xs sm:text-sm uppercase tracking-[0.15em] italic leading-none">{userName || "User"}</p>
                    <p className="text-zinc-500 text-[9px] font-bold truncate mt-2 uppercase tracking-widest opacity-60">{userEmail}</p>
                  </div>
                  
                  {/* Links Section */}
                  <div className="p-2 sm:p-3 space-y-1">
                    <button
                      onClick={() => { navigate("/user/dashboard"); setShowProfile(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-black text-zinc-400 hover:bg-white/5 hover:text-white rounded-xl sm:rounded-2xl transition-all group uppercase tracking-widest"
                    >
                      <LayoutDashboard size={16} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                      Dashboard
                    </button>
                    
                    <button
                      onClick={() => { navigate("/user/bookings"); setShowProfile(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-black text-zinc-400 hover:bg-white/5 hover:text-white rounded-xl sm:rounded-2xl transition-all group uppercase tracking-widest"
                    >
                      <Calendar size={16} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                      My Bookings
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="p-2 sm:p-3 border-t border-white/5 bg-red-600/[0.03]">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white rounded-xl sm:rounded-[1.2rem] transition-all duration-300 uppercase tracking-[0.2em]"
                    >
                      Sign Out
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;