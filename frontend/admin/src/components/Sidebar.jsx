import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wrench, 
  Package, 
  CalendarDays, 
  LogOut,
  Settings
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Agar logo 'public' folder mein hai to seedha "/logo.png" use hota hai.
  // 2. Agar logo 'src/assets' mein hai to upar import karna padega.
  const logoPath = "src/assets/T-Logo.png"; 

  const handleLogout = () => {
    if (window.confirm("Confirm Logout from G97 Admin?")) {
      localStorage.removeItem("adminToken");
      navigate("/");
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
    <aside className="w-72 bg-[#0a0f18] text-white min-h-screen p-6 flex flex-col border-r border-white/5 shadow-2xl relative z-50">
      
      {/* 🏎️ BRAND LOGO SECTION */}
      <div className="flex items-center gap-4 mb-12 px-2 mt-4">
        <div className="relative group">
          {/* Logo Glow Effect */}
          <div className="absolute -inset-1 bg-red-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <div className="relative bg-slate-900 w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
            <img 
              src={logoPath} 
              alt="G97" 
              className="w-full h-full object-cover bg-white p-1.5"
              onError={(e) => {
                // Agar logo nahi mila to fallback icon dikhega
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-red-600 font-black text-xl italic">G</span>';
              }} 
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase italic leading-none tracking-tighter">
            G97 <span className="text-red-600 italic underline decoration-2 underline-offset-4">AUTO</span>
          </h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">Precision Care</p>
        </div>
      </div>

      {/* 🧭 NAVIGATION LINKS */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative ${
              isActive(item.path)
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={`${isActive(item.path) ? "text-white" : "text-slate-500 group-hover:text-red-500"} transition-colors duration-300`}>
              {item.icon}
            </span>
            <span className="font-bold uppercase tracking-[0.15em] text-[10px]">
              {item.name}
            </span>

            {/* Active Indicator Bar */}
            {isActive(item.path) && (
              <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* ⚙️ BOTTOM SECTION */}
      <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
        <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-slate-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
           <Settings size={18} />
           <span>Settings</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-slate-400 hover:bg-red-600/10 hover:text-red-500 transition-all duration-300 group bg-slate-900/30 border border-white/5"
        >
          <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg">
            <LogOut size={16} />
          </div>
          <span className="font-black uppercase tracking-widest text-[10px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;