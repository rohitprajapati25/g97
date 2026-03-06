import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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
          ? "bg-darkbg/90 backdrop-blur-2xl border-b border-white/5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO SECTION --- */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer group relative"
        >
          {/* Subtle logo background glow using Logo Colors */}
          <div className="absolute -inset-6 bg-gradient-to-r from-red-600/10 to-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
          
          <img 
            src={logo} 
            alt="Auto Hub Detailing Studio" 
            className="relative h-10 w-auto md:h-14 object-contain transform transition duration-500 group-hover:scale-105" 
          />
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex items-center gap-6">
          {!userToken && (
            <div className="flex items-center gap-4">
              <Link
                to="/user/login"
                className="text-zinc-400 hover:text-white px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                Sign In
              </Link>
              
              <Link
                to="/user/register"
                className="hidden md:block px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white/10 hover:border-white/20 transition-all"
              >
                Join Now
              </Link>

              <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block"></div>

              <Link
                to="/Login"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all hover:-translate-y-0.5 active:scale-95"
              >
                ADMIN
              </Link>
            </div>
          )}

          {userToken && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-red-600/40 hover:bg-zinc-800/80 transition-all duration-300 group shadow-xl"
              >
                {/* Profile Avatar matching Logo Gradient (Red to Blue) */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-[#1E3A8A] flex items-center justify-center text-white text-[11px] font-black shadow-[0_5px_15px_rgba(220,38,38,0.3)] ring-1 ring-white/20">
                  {getInitials(userName)}
                </div>
                
                <span className="hidden sm:block text-zinc-200 text-[11px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                  {userName?.split(' ')[0] || "User"}
                </span>

                <svg
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-500 ${showProfile ? "rotate-180 text-red-500" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DROPDOWN MENU */}
              {showProfile && (
                <div className="absolute right-0 mt-4 w-64 origin-top-right rounded-[2rem] bg-darknav border border-white/10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
                  <div className="px-6 py-5 bg-gradient-to-br from-white/[0.05] to-transparent border-b border-white/5">
                    <p className="text-white font-black text-xs uppercase tracking-[0.2em] italic">{userName || "User"}</p>
                    <p className="text-zinc-500 text-[9px] font-bold truncate mt-1.5 uppercase tracking-widest leading-none">{userEmail}</p>
                  </div>
                  
                  <div className="p-3">
                    <button
                      onClick={() => { navigate("/user/dashboard"); setShowProfile(false); }}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-[10px] font-black text-zinc-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all group uppercase tracking-widest"
                    >
                      <span className="text-sm grayscale group-hover:grayscale-0 transition-all">📊</span> Dashboard
                    </button>
                    
                    <button
                      onClick={() => { navigate("/user/bookings"); setShowProfile(false); }}
                      className="flex w-full items-center gap-4 px-4 py-3.5 text-[10px] font-black text-zinc-400 hover:bg-white/5 hover:text-white rounded-2xl transition-all group uppercase tracking-widest"
                    >
                      <span className="text-sm grayscale group-hover:grayscale-0 transition-all">📅</span> My Bookings
                    </button>
                  </div>

                  <div className="p-3 border-t border-white/5 bg-red-600/[0.02]">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between px-5 py-4 text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white rounded-[1.2rem] transition-all duration-300 uppercase tracking-[0.2em]"
                    >
                      Sign Out
                      <LogOutIcon />
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

// Small helper icon for logout
const LogOutIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
    </svg>
);

export default Navbar;