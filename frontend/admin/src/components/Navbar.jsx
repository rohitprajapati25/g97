import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/T-Logo.png";

function Navbar() {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("userToken");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");

  const [showProfile, setShowProfile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Scroll effect for navbar background
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
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-2" 
          : "bg-black bg-opacity-10 py-4 shadow-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- LOGO --- */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-red-600 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
            <img src={logo} alt="Logo" className="relative h-10 w-auto transform transition group-hover:scale-110" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">
            G97 <span className="text-red-600 not-italic">AUTO</span>
          </span>
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex items-center gap-4">
          
          {/* GUEST LINKS */}
          {!userToken && (
            <div className="flex items-center gap-2">
              <Link
                to="/user/login"
                className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition"
              >
                Sign In
              </Link>
              
              <Link
                to="/user/register"
                className="hidden md:block px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition"
              >
                Join Now
              </Link>

              <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block"></div>

              <Link
                to="/Login"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5"
              >
                Admin Panel
              </Link>
            </div>
          )}

          {/* USER PROFILE */}
          {userToken && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/50 hover:bg-white/20 transition group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                  {getInitials(userName)}
                </div>
                
                <span className="hidden sm:block text-white text-sm font-semibold">
                  {userName?.split(' ')[0] || "User"}
                </span>

                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfile ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* DROPDOWN MENU */}
              {showProfile && (
                <div className="absolute right-0 mt-4 w-72 origin-top-right rounded-2xl bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-2xl">
                  {/* Header */}
                  <div className="px-6 py-5 bg-white/[0.03] border-b border-white/5">
                    <p className="text-white font-bold text-base">{userName || "User"}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{userEmail}</p>
                  </div>

                  {/* Links */}
                  <div className="p-2">
                    <button
                      onClick={() => { navigate("/user/dashboard"); setShowProfile(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition"
                    >
                      <span className="text-lg opacity-50">📊</span> Dashboard
                    </button>
                    
                    <button
                      onClick={() => { navigate("/user/bookings"); setShowProfile(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition"
                    >
                      <span className="text-lg opacity-50">📅</span> My Bookings
                    </button>
                  </div>

                  {/* Footer/Logout */}
                  <div className="p-2 border-t border-white/5 bg-red-500/5">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition duration-300"
                    >
                      <span className="text-lg">Logout</span>
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