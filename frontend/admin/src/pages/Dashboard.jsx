import { useEffect, useState } from "react";
import api from "../api/axios";
import { Package, Layers, CalendarCheck, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState({ services: 0, products: 0, bookings: 0 });
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

  const handleGenerate = async () => {
    setSetupError("");
    try {
      const res = await api.get("/admin/2fa/setup", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrUrl(res.data.otpauthUrl);
      setSetupStep("verify");
    } catch {
      setSetupError("Unable to generate 2FA secret");
    }
  };

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
    <div className="p-8 bg-darkbg min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-red-600"></span>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Real-time Analytics</p>
            </div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter">
              Studio <span className="text-red-600">Overview</span>
            </h2>
          </div>
          <div className="hidden md:block text-right">
             <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Auto Hub Detailing Studio</p>
             <p className="text-zinc-400 text-sm font-black italic">v2.0.4 Admin</p>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
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

        {/* 2FA SECTION */}
        <div className="mt-8 p-6 rounded-2xl bg-zinc-900/40 border border-white/5">
          {admin && (
            <div className="flex items-center justify-between">
              <p className="text-sm">Two‑factor authentication:</p>
              <p className="font-bold">
                {admin.twoFactorEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          )}
          {!admin?.twoFactorEnabled && setupStep !== "verify" && (
            <button
              className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-xs uppercase font-black tracking-wide hover:bg-red-700"
              onClick={handleGenerate}
            >
              Enable 2FA
            </button>
          )}
          {setupError && (
            <p className="mt-2 text-red-400 text-xs">{setupError}</p>
          )}

          {setupStep === "verify" && (
            <div className="mt-4">
              <p className="text-xs mb-2">Scan QR code with an authenticator app</p>
              {qrUrl && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                    qrUrl
                  )}&size=150x150`}
                  alt="2FA QR"
                />
              )}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-zinc-800 text-white p-2 rounded"
                />
                <button
                  onClick={handleVerify}
                  className="ml-2 px-3 py-2 bg-green-600 rounded text-xs uppercase font-black"
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY PLACEHOLDER */}
        <div className="mt-12 p-8 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase italic tracking-tight">Recent Detailing Orders</h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition">View All Orders</button>
            </div>
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <TrendingUp size={40} className="mx-auto text-zinc-800 mb-4" />
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No recent activity detected</p>
            </div>
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