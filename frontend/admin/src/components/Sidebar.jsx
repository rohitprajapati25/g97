import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  CalendarDays, 
  LogOut,
  Settings,
  UserCircle
} from "lucide-react";
import logo from "../assets/logo.png"; // New Logo Import

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("Confirm Logout from Auto Hub Admin?")) {
      localStorage.removeItem("adminToken");
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Services", path: "/admin/services", icon: <Wrench size={18} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={18} /> },
    { name: "Bookings", path: "/bookings", icon: <CalendarDays size={18} /> },
  ];

  return (
    <aside className="w-72 bg-[#050507] text-white min-h-screen p-6 flex flex-col border-r border-white/5 shadow-2xl relative z-50">
      
      {/* 🏎️ BRAND LOGO SECTION */}
      <div className="flex flex-col items-center mb-10 px-2 mt-4">
        <div className="relative group cursor-pointer" onClick={() => navigate("/dashboard")}>
          {/* Logo Glow Effect */}
          <div className="absolute -inset-4 bg-red-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
          
          <img 
            src={logo} 
            alt="Auto Hub Logo" 
            className="relative h-14 w-auto object-contain transform transition duration-500 group-hover:scale-105" 
          />
        </div>
        
        <div className="mt-4 text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Admin Control</p>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION LINKS */}
      <nav className="flex-1 space-y-2">
        <p className="px-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Main Menu</p>
        
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
              isActive(item.path)
                ? "bg-gradient-to-r from-red-600/20 to-transparent text-white border-l-2 border-red-600"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <span className={`${isActive(item.path) ? "text-red-500" : "text-zinc-600 group-hover:text-red-500"} transition-colors duration-300`}>
              {item.icon}
            </span>
            <span className={`font-bold uppercase tracking-widest text-[10px] ${isActive(item.path) ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
              {item.name}
            </span>

            {/* Active Glow */}
            {isActive(item.path) && (
              <div className="absolute inset-0 bg-red-600/5 blur-xl -z-10"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* ⚙️ BOTTOM SECTION */}
      <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
        <div className="px-4 py-3 flex items-center gap-3 mb-4 rounded-xl bg-zinc-900/50 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-red-500">
                <UserCircle size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">Super Admin</p>
                <p className="text-[8px] font-medium text-zinc-500 truncate lowercase">admin@autohub.com</p>
            </div>
        </div>

        <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-zinc-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group">
           <Settings size={16} className="group-hover:rotate-45 transition-transform duration-500" />
           <span>Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-xl text-red-500/70 hover:bg-red-600 hover:text-white transition-all duration-300 group shadow-lg"
        >
          <LogOut size={16} />
          <span className="font-black uppercase tracking-widest text-[10px]">Logout System</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;