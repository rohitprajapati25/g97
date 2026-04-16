import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  CalendarDays, 
  LogOut,
  Settings,
  UserCircle,
  X
} from "lucide-react";
import logo from "../assets/logo.png";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Read admin info from localStorage
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const adminEmail = adminData.email || "admin@autohub.com";
  const adminName = adminData.name || adminEmail.split("@")[0] || "Admin";

  const handleLogout = () => {
    if (window.confirm("Confirm Logout from Auto Hub Admin?")) {
      localStorage.removeItem("adminToken");
      navigate("/");
      onClose?.();
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Services", path: "/admin/services", icon: <Wrench size={20} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Bookings", path: "/bookings", icon: <CalendarDays size={20} /> },
  ];

  return (
    <>
      {/* 🌑 OVERLAY (Mobile only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 🏁 SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 text-white transform transition-transform duration-300 ease-in-out flex flex-col border-r border-white/5 shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
      `}>
        
        {/* MOBILE CLOSE HEADER */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-red-500 uppercase">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* 🏎️ BRAND LOGO SECTION */}
        <div className="flex flex-col items-center py-8 px-6">
          <div className="relative group cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            <img 
              src={logo} 
              alt="Auto Hub Logo" 
              className="relative h-12 w-auto object-contain transform transition duration-500 group-hover:scale-105" 
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <p className="text-xs sm:text-sm font-black text-zinc-500 uppercase tracking-[0.3em]">Admin Control</p>
          </div>
        </div>

        {/* 🧭 NAVIGATION LINKS */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose?.()}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                ${isActive(item.path)
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className={`${isActive(item.path) ? "text-white" : "group-hover:text-red-500"} transition-colors`}>
                {item.icon}
              </div>
              <span className="font-semibold text-sm md:text-base tracking-wide">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* ⚙️ BOTTOM SECTION */}
        <div className="p-4 border-t border-white/5 space-y-3 bg-zinc-950/50">
          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-red-500">
              <UserCircle size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate uppercase">{adminName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{adminEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {/* Settings Button */}
            <Link 
              to="/admin/settings"
              onClick={() => onClose?.()}
              className={`col-span-2 flex items-center justify-center p-3 rounded-xl transition-all border border-white/5
                ${isActive("/admin/settings") 
                  ? "bg-red-600 text-white" 
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
            >
              <Settings size={20} />
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="col-span-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all group"
            >
              <LogOut size={20} />
              <span className="text-xs font-bold uppercase">Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;