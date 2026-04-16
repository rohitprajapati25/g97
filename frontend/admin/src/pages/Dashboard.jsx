
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Package, Layers, CalendarCheck, TrendingUp, Clock,
  Car, User, Phone, CheckCircle2, XCircle, Timer, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCardSkeleton, RecentBookingSkeleton, ErrorState } from "../components/Skeleton";

// ─── Colour palette ───────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending:   "#f59e0b",
  Confirmed: "#3b82f6",
  Completed: "#10b981",
  Cancelled: "#ef4444",
};
const PIE_FALLBACK = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return t;
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-black text-sm" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-darkbg min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Real-time Analytics</p>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter">
              Studio <span className="text-red-600">Overview</span>
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Auto Hub Detailing Studio</p>
            <p className="text-zinc-400 text-sm font-black italic">Admin Dashboard</p>
          </div>
        </div>

        {/* ── Error ── */}
        {error && !loading && <ErrorState message={error} onRetry={fetchData} />}

        {!error && (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
              ) : (
                <>
                  <StatCard
                    title="Total Bookings"
                    value={data?.bookings ?? 0}
                    icon={<CalendarCheck size={24} />}
                    accent="red"
                    sub={`${data?.pendingBookings ?? 0} pending`}
                  />
                  <StatCard
                    title="Completed"
                    value={data?.completedBookings ?? 0}
                    icon={<CheckCircle2 size={24} />}
                    accent="emerald"
                    sub="services done"
                  />
                  <StatCard
                    title="Services"
                    value={data?.services ?? 0}
                    icon={<Layers size={24} />}
                    accent="blue"
                    sub="active packages"
                  />
                  <StatCard
                    title="Products"
                    value={data?.products ?? 0}
                    icon={<Package size={24} />}
                    accent="amber"
                    sub="in inventory"
                  />
                </>
              )}
            </div>

            {/* ── Charts Row 1: Area + Pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Bookings last 7 days — Area Chart */}
              <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Last 7 Days</p>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Booking Trend</h3>
                  </div>
                  <TrendingUp size={20} className="text-red-500" />
                </div>
                {loading ? (
                  <div className="h-52 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data?.dailyBookings || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Bookings"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        fill="url(#bookingGrad)"
                        dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#ef4444" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Booking Status — Pie Chart */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Distribution</p>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">By Status</h3>
                  </div>
                  <AlertCircle size={20} className="text-amber-500" />
                </div>
                {loading ? (
                  <div className="h-52 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !data?.statusData?.length ? (
                  <div className="h-52 flex items-center justify-center text-zinc-700 text-xs font-bold uppercase tracking-widest">
                    No data yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={data.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.statusData.map((entry, i) => (
                            <Cell
                              key={i}
                              fill={STATUS_COLORS[entry.name] || PIE_FALLBACK[i % PIE_FALLBACK.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {data.statusData.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: STATUS_COLORS[s.name] || PIE_FALLBACK[i % PIE_FALLBACK.length] }}
                          />
                          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest truncate">
                            {s.name}
                          </span>
                          <span className="text-white text-[10px] font-black ml-auto">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Charts Row 2: Bar Chart (bookings per service) ── */}
            {!loading && data?.serviceData?.length > 0 && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Top Services</p>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Bookings by Service</h3>
                  </div>
                  <Layers size={20} className="text-blue-500" />
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.serviceData} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#71717a", fontSize: 9, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="bookings" name="Bookings" radius={[6, 6, 0, 0]}>
                      {data.serviceData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#ef4444" : i === 1 ? "#f97316" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Status Summary Pills ── */}
            {!loading && data && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Pending",   value: data.pendingBookings,   color: "amber",   icon: <Timer size={16}/> },
                  { label: "Confirmed", value: data.confirmedBookings, color: "blue",    icon: <CheckCircle2 size={16}/> },
                  { label: "Completed", value: data.completedBookings, color: "emerald", icon: <CheckCircle2 size={16}/> },
                  { label: "Cancelled", value: data.cancelledBookings, color: "red",     icon: <XCircle size={16}/> },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-3 p-4 rounded-2xl border bg-${s.color}-500/5 border-${s.color}-500/20`}
                  >
                    <span className={`text-${s.color}-500`}>{s.icon}</span>
                    <div>
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{s.label}</p>
                      <p className={`text-${s.color}-400 font-black text-xl`}>{s.value ?? 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Recent Bookings ── */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 sm:p-8 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Latest Activity</p>
                  <h3 className="text-xl font-black uppercase italic tracking-tight">Recent Orders</h3>
                </div>
                <button
                  onClick={() => navigate("/bookings")}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition border border-red-500/20 hover:border-red-500/50 px-4 py-2 rounded-xl"
                >
                  View All
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <RecentBookingSkeleton key={i} />)}
                </div>
              ) : data?.recentBookings?.length > 0 ? (
                <div className="space-y-3">
                  {data.recentBookings.map((b) => (
                    <div
                      key={b._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all gap-3 sm:gap-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-600/10 rounded-xl flex-shrink-0">
                          <Car size={16} className="text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <User size={12} className="text-zinc-500 flex-shrink-0" />
                            <span className="text-white font-bold text-sm truncate">{b.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={11} className="text-zinc-600 flex-shrink-0" />
                            <span className="text-zinc-500 text-xs">{b.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                        <div>
                          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Service</p>
                          <p className="text-white text-xs font-bold truncate max-w-[120px]">{b.service}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Car</p>
                          <p className="text-white text-xs font-bold">{b.carType}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Date</p>
                          <p className="text-white text-xs font-bold">{b.date}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-zinc-500" />
                          <p className="text-white text-xs font-bold">{fmt12(b.time)}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl">
                  <TrendingUp size={36} className="mx-auto text-zinc-800 mb-4" />
                  <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No recent activity</p>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
const ACCENT = {
  red:     { border: "border-red-500/20",     icon: "bg-red-500/10 text-red-500",     val: "text-red-400"     },
  emerald: { border: "border-emerald-500/20", icon: "bg-emerald-500/10 text-emerald-500", val: "text-emerald-400" },
  blue:    { border: "border-blue-500/20",    icon: "bg-blue-500/10 text-blue-500",   val: "text-blue-400"    },
  amber:   { border: "border-amber-500/20",   icon: "bg-amber-500/10 text-amber-500", val: "text-amber-400"   },
};

function StatCard({ title, value, icon, accent = "red", sub }) {
  const a = ACCENT[accent] || ACCENT.red;
  return (
    <div className={`bg-zinc-900/50 p-5 sm:p-6 rounded-[2rem] border ${a.border} hover:bg-zinc-900 transition-all duration-300`}>
      <div className={`inline-flex p-3 rounded-2xl mb-4 ${a.icon}`}>
        {icon}
      </div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className={`text-4xl font-black italic tracking-tighter ${a.val}`}>{value}</p>
      {sub && <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">{sub}</p>}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const cls = map[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  return (
    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {status || "Unknown"}
    </span>
  );
}
