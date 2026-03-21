import { useEffect, useState } from "react";
import api from "../api/axios";
import { Package, Layers, CalendarCheck, TrendingUp, Clock, Car, User, Mail, Phone } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState({ services: 0, products: 0, bookings: 0, recentBookings: [] });
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [setupStep, setSetupStep] = useState("");
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch dashboard data and profile in parallel
        const [dashboardRes, profileRes] = await Promise.all([
          api.get("/dashboard", {
            headers: { Authorization: `Bearer ${token}` }
         
          }),
          api.get("/admin/me", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setData(dashboardRes.data);
        setAdmin(profileRes.data);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-darkbg">
        <div className="relative">
            <div className="h-16 w-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 blur-xl bg-red-600/20 animate-pulse"></div>
        </div>
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] mt-6">Initializing System...</p>
      </div>
    );
  }

  const token = localStorage.getItem("adminToken");

 
  const handleVerify = async () => {
    setSetupError("");
    try {
      await api.post("/admin/2fa/verify", { token: code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSetupStep("");
      // refresh profile
      const res = await api.get("/admin/me", { headers: { Authorization: `Bearer ${token}` } });
      setAdmin(res.data);
    } catch (err) {
      setSetupError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-darkbg min-h-screen text-white">
      <div className="max-w-4xl sm:max-w-6xl lg:max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
          <p className="text-zinc-500 text-xs sm:text-sm font-black uppercase tracking-widest">Real-time Analytics</p>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase italic tracking-tighter">
              Studio <span className="text-red-600">Overview</span>
            </h2>
          </div>
          <div className="text-center sm:text-right">
             <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Auto Hub Detailing Studio</p>
             <p className="text-zinc-400 text-sm font-black italic">v2.0.4 Admin</p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* SERVICES CARD */}
          <StatCard 
            title="Total Services" 
            value={data?.services || 0} 
            icon={<Layers size={28} />} 
            color="border-blue-500/20"
            iconColor="text-blue-500"
          />

          {/* PRODUCTS CARD */}
          <StatCard 
            title="Total Products" 
            value={data?.products || 0} 
            icon={<Package size={28} />} 
            color="border-emerald-500/20"
            iconColor="text-emerald-500"
          />

          {/* BOOKINGS CARD */}
          <StatCard 
            title="Total Bookings" 
            value={data?.bookings || 0} 
            icon={<CalendarCheck size={28} />} 
            color="border-red-500/20"
            iconColor="text-red-600"
          />

        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
            <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase italic tracking-tight">Recent Detailing Orders</h3>
                <button className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition">View All Orders</button>
            </div>
            
            {data?.recentBookings && data.recentBookings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {data.recentBookings.map((booking) => (
                  <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950/50 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 transition-all gap-4 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-red-600/10 rounded-lg sm:rounded-xl flex-shrink-0">
                        <Car size={18} sm:size={20} className="text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} className="text-zinc-500 flex-shrink-0" />
                          <span className="text-white font-bold text-sm truncate">{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-zinc-600 flex-shrink-0" />
                          <span className="text-zinc-500 text-xs truncate">{booking.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      <div className="w-full sm:w-auto text-left sm:text-center">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Service</p>
                        <p className="text-white text-sm font-bold truncate">{booking.service}</p>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-center">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Car Type</p>
                        <p className="text-white text-sm font-bold truncate">{booking.carType}</p>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-center flex items-center gap-1">
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Date</p>
                        <p className="text-white text-sm font-bold">{booking.date}</p>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-center flex items-center gap-1">
                        <Clock size={12} className="text-zinc-500 flex-shrink-0" />
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest hidden sm:inline">Time</p>
                        <p className="text-white text-sm font-bold">{booking.time}</p>
                      </div>
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <TrendingUp size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No recent activity detected</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard Component for clean look
function StatCard({ title, value, icon, color, iconColor }) {
    return (
      <div className={`group relative bg-zinc-900/50 p-8 rounded-[2.5rem] border ${color} hover:bg-zinc-900 transition-all duration-500`}>
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            {icon}
        </div>
        <div className={`${iconColor} mb-6 p-4 bg-zinc-950 inline-block rounded-2xl border border-white/5 shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-white italic tracking-tighter">
              {value}
            </h3>
            <span className="text-xs font-bold text-zinc-700 uppercase italic">Units</span>
          </div>
        </div>
      </div>
    );
}

// Status Badge Component with color coding
function StatusBadge({ status }) {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "bg-emerald-500/20", text: "text-emerald-500", border: "border-emerald-500/30" };
      case "pending":
        return { bg: "bg-yellow-500/20", text: "text-yellow-500", border: "border-yellow-500/30" };
      case "cancelled":
        return { bg: "bg-red-500/20", text: "text-red-500", border: "border-red-500/30" };
      case "confirmed":
        return { bg: "bg-blue-500/20", text: "text-blue-500", border: "border-blue-500/30" };
      default:
        return { bg: "bg-zinc-500/20", text: "text-zinc-500", border: "border-zinc-500/30" };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${styles.bg} ${styles.text} border ${styles.border}`}>
      {status || "Unknown"}
    </span>
  );
}
