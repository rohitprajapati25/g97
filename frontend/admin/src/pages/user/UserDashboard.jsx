
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import {
  CalendarCheck, CheckCircle2, Clock, Car, Timer,
  AlertCircle, ChevronRight, Sparkles, ArrowRight,
  ShoppingBag, Bell, Shield, Phone, Mail,
  Wrench, Star, ArrowLeft,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_STYLE = {
  Confirmed: { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: <CheckCircle2 size={11} /> },
  Completed: { pill: "bg-blue-50 text-blue-700 border-blue-200",         dot: "bg-blue-500",    icon: <CheckCircle2 size={11} /> },
  Pending:   { pill: "bg-amber-50 text-amber-700 border-amber-200",      dot: "bg-amber-400",   icon: <Timer size={11} />        },
  Cancelled: { pill: "bg-red-50 text-red-700 border-red-200",            dot: "bg-red-500",     icon: <AlertCircle size={11} />  },
};

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${s.pill}`}>
      {s.icon} {status}
    </span>
  );
};

const STRIP = {
  Confirmed: "bg-emerald-500", Completed: "bg-blue-500",
  Pending: "bg-amber-400",     Cancelled: "bg-red-500",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem("userName")  || "Member";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userPhone = localStorage.getItem("userPhone") || "";

  const [bookings,      setBookings]      = useState([]);
  const [services,      setServices]      = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [greeting,      setGreeting]      = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else             setGreeting("Good evening");
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes, nRes] = await Promise.allSettled([
        api.get("/bookings/my"),
        api.get("/services"),
        api.get("/notifications"),
      ]);
      if (bRes.status === "fulfilled") setBookings(bRes.value.data.bookings || bRes.value.data || []);
      if (sRes.status === "fulfilled") setServices((sRes.value.data.services || sRes.value.data || []).slice(0, 3));
      if (nRes.status === "fulfilled") setNotifications((nRes.value.data.notifications || []).slice(0, 4));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total     = bookings.length;
  const pending   = bookings.filter((b) => b.status === "Pending").length;
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const completed = bookings.filter((b) => b.status === "Completed").length;
  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
  const upcoming  = pending + confirmed;

  // Next upcoming booking
  const nextBooking = bookings
    .filter((b) => b.status === "Confirmed" || b.status === "Pending")
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

  // Recent 4 bookings
  const recent = [...bookings].slice(0, 4);

  // Unread notifications
  const unreadCount = notifications.filter((n) => n.status !== "seen").length;

  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <Navbar />

      {/* ════════════════════════════════════════════════════════════════════
          HERO — dark banner with greeting + next appointment
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 pt-24 sm:pt-28 pb-28 px-4 sm:px-6 relative overflow-hidden">
        {/* bg decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/8 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-900/8 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

            {/* Left — greeting */}
            <div>
              {/* Back nav */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-5 group"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Member Portal</p>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">
                {greeting},<br />
                <span className="text-red-500">{userName.split(" ")[0]}</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-3 max-w-sm">
                Welcome back to Auto Hub. Your car deserves the best.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => navigate("/services")}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-900/30">
                  <Sparkles size={13} /> Book Service
                </button>
                <button onClick={() => navigate("/user/bookings")}
                  className="flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white border border-white/10 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                  <CalendarCheck size={13} /> My Bookings
                </button>
                <button onClick={() => navigate("/store")}
                  className="flex items-center gap-2 bg-white/8 hover:bg-white/15 text-white border border-white/10 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                  <ShoppingBag size={13} /> Shop
                </button>
              </div>
            </div>

            {/* Right — next appointment card */}
            {!loading && nextBooking ? (
              <div className="lg:w-80 bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em]">Next Appointment</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-white/10">
                    <img src={nextBooking.serviceImage || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330?w=100&h=100&fit=crop"}
                      alt={nextBooking.service} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm uppercase italic truncate">{nextBooking.service}</p>
                    <p className="text-zinc-400 text-[10px] font-bold mt-0.5">{nextBooking.carType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-white/5 rounded-xl p-2.5">
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Date</p>
                    <p className="text-white font-black text-xs mt-0.5">{nextBooking.date}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5">
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Time</p>
                    <p className="text-white font-black text-xs mt-0.5">{fmt12(nextBooking.time)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <StatusPill status={nextBooking.status} />
                </div>
              </div>
            ) : !loading && (
              <div className="lg:w-80 bg-white/5 border border-white/10 border-dashed rounded-3xl p-6 flex-shrink-0 text-center">
                <div className="text-4xl mb-3">🏎️</div>
                <p className="text-zinc-400 font-black text-sm uppercase italic">No upcoming bookings</p>
                <button onClick={() => navigate("/services")}
                  className="mt-4 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-colors">
                  Book now →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT — overlaps hero by -mt-12
      ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 pb-20 space-y-5 relative z-10">

        {/* ── 4 Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />
            ))
          ) : (
            <>
              <StatCard label="Total"     value={total}     icon={<CalendarCheck size={20}/>} color="red"     />
              <StatCard label="Upcoming"  value={upcoming}  icon={<Clock size={20}/>}         color="amber"   />
              <StatCard label="Completed" value={completed} icon={<CheckCircle2 size={20}/>}  color="emerald" />
              <StatCard label="Cancelled" value={cancelled} icon={<AlertCircle size={20}/>}   color="slate"   />
            </>
          )}
        </div>

        {/* ── Main 2-col grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: Recent Bookings (2/3) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recent bookings card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">History</p>
                  <h3 className="text-slate-900 font-black text-base uppercase italic tracking-tight">Recent Bookings</h3>
                </div>
                <button onClick={() => navigate("/user/bookings")}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-[10px] font-black uppercase tracking-widest transition-colors">
                  View All <ChevronRight size={13} />
                </button>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center py-14 px-6 text-center">
                  <div className="text-5xl mb-3">🏎️</div>
                  <p className="text-slate-700 font-black uppercase italic text-base mb-1">No bookings yet</p>
                  <p className="text-slate-400 text-xs mb-5">Give your car the treatment it deserves.</p>
                  <button onClick={() => navigate("/services")}
                    className="bg-red-600 hover:bg-red-500 text-white px-7 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                    Book Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recent.map((b) => (
                    <div key={b._id} onClick={() => navigate("/user/bookings")}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group">
                      {/* strip */}
                      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${STRIP[b.status] || "bg-slate-300"}`} />
                      {/* image */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        <img src={b.serviceImage || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330?w=80&h=80&fit=crop"}
                          alt={b.service} className="w-full h-full object-cover" />
                      </div>
                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-black text-sm uppercase italic truncate leading-tight">{b.service}</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-0.5 flex items-center gap-2">
                          <Car size={9} className="inline" /> {b.carType}
                          <span className="text-slate-200">·</span>
                          {b.date} {fmt12(b.time)}
                        </p>
                      </div>
                      {/* status */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="hidden sm:block"><StatusPill status={b.status} /></div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Booking Status Breakdown ── */}
            {!loading && total > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-4">Booking Breakdown</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Pending",   val: pending,   max: total, color: "bg-amber-400"   },
                    { label: "Confirmed", val: confirmed, max: total, color: "bg-emerald-500"  },
                    { label: "Completed", val: completed, max: total, color: "bg-blue-500"     },
                    { label: "Cancelled", val: cancelled, max: total, color: "bg-red-400"      },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest w-20 flex-shrink-0">{row.label}</p>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full transition-all duration-700`}
                          style={{ width: `${total > 0 ? (row.val / total) * 100 : 0}%` }} />
                      </div>
                      <p className="text-slate-700 font-black text-xs w-5 text-right flex-shrink-0">{row.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (1/3) ── */}
          <div className="space-y-5">

            {/* Profile card */}
            <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                {/* Avatar */}
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-4 shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-black text-base uppercase italic tracking-tight leading-tight">{userName}</p>
                <div className="mt-3 space-y-1.5">
                  {userEmail && (
                    <div className="flex items-center gap-2">
                      <Mail size={11} className="text-zinc-500 flex-shrink-0" />
                      <p className="text-zinc-400 text-[10px] font-bold truncate">{userEmail}</p>
                    </div>
                  )}
                  {userPhone && (
                    <div className="flex items-center gap-2">
                      <Phone size={11} className="text-zinc-500 flex-shrink-0" />
                      <p className="text-zinc-400 text-[10px] font-bold">{userPhone}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  <Shield size={11} className="text-emerald-500" />
                  <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Verified Member</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-slate-600" />
                  <p className="text-slate-900 font-black text-sm uppercase italic tracking-tight">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </div>
              </div>
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => {
                    const isUnread = n.status !== "seen";
                    const iconMap = {
                      approved: <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />,
                      rejected: <AlertCircle size={13} className="text-red-500 flex-shrink-0" />,
                      info:     <Bell size={13} className="text-blue-500 flex-shrink-0" />,
                    };
                    return (
                      <div key={n._id} className={`flex items-start gap-3 px-4 py-3 ${isUnread ? "bg-red-50/40" : ""}`}>
                        <div className="mt-0.5">{iconMap[n.type] || <Timer size={13} className="text-amber-500 flex-shrink-0" />}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${isUnread ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                            {n.message}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">
                            {fmtDate(n.createdAt)}
                          </p>
                        </div>
                        {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Available Services Preview ── */}
        {!loading && services.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">What we offer</p>
                <h3 className="text-slate-900 font-black text-base uppercase italic tracking-tight">Our Services</h3>
              </div>
              <button onClick={() => navigate("/services")}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-[10px] font-black uppercase tracking-widest transition-colors">
                View All <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
              {services.map((s) => (
                <button key={s._id} onClick={() => navigate("/services")}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={s.image || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330?w=80&h=80&fit=crop"}
                      alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-black text-xs uppercase italic truncate">{s.title}</p>
                    <p className="text-red-600 font-black text-sm mt-0.5">&#8377;{s.price}</p>
                    <p className="text-slate-400 text-[9px] font-bold flex items-center gap-1 mt-0.5">
                      <Clock size={9} /> {s.duration}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Links Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Wrench size={20} />,      label: "Book Service",  sub: "New appointment",    path: "/services",       color: "red"     },
            { icon: <CalendarCheck size={20}/>, label: "My Bookings",  sub: "View history",       path: "/user/bookings",  color: "slate"   },
            { icon: <ShoppingBag size={20} />,  label: "Pro Shop",     sub: "Car care products",  path: "/store",          color: "slate"   },
            { icon: <Phone size={20} />,        label: "Contact Us",   sub: "WhatsApp support",   path: null,              color: "emerald", wa: true },
          ].map((item) => (
            <button key={item.label}
              onClick={() => item.wa ? window.open("https://wa.me/916359274784", "_blank") : navigate(item.path)}
              className={`flex flex-col items-start p-4 rounded-2xl border transition-all group text-left ${
                item.color === "red"
                  ? "bg-red-600 border-red-600 hover:bg-red-500"
                  : item.color === "emerald"
                    ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-500"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
              }`}>
              <div className={`mb-3 ${item.color === "red" || item.color === "emerald" ? "text-white" : "text-slate-600"}`}>
                {item.icon}
              </div>
              <p className={`font-black text-xs uppercase tracking-wide leading-tight ${
                item.color === "red" || item.color === "emerald" ? "text-white" : "text-slate-800"
              }`}>{item.label}</p>
              <p className={`text-[10px] font-bold mt-0.5 ${
                item.color === "red" || item.color === "emerald" ? "text-white/70" : "text-slate-400"
              }`}>{item.sub}</p>
            </button>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-0 top-0 w-64 h-64 bg-red-600/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <p className="text-amber-400 text-[9px] font-black uppercase tracking-[0.3em]">Premium Detailing</p>
              </div>
              <h3 className="text-white font-black text-xl sm:text-2xl uppercase italic tracking-tight">
                Ready for your next detail?
              </h3>
              <p className="text-zinc-500 text-xs mt-1.5 max-w-xs">
                Nano ceramic coating, PPF, full detailing — book your slot in under 60 seconds.
              </p>
            </div>
            <button onClick={() => navigate("/services")}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white px-7 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/30 flex-shrink-0">
              Book Now <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
const STAT_COLORS = {
  red:     { bg: "bg-red-50",     icon: "text-red-600",     val: "text-red-600"     },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600",   val: "text-amber-700"   },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", val: "text-emerald-700" },
  slate:   { bg: "bg-slate-100",  icon: "text-slate-500",   val: "text-slate-700"   },
};

function StatCard({ label, value, icon, color }) {
  const c = STAT_COLORS[color] || STAT_COLORS.slate;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">{label}</p>
        <p className={`text-2xl font-black leading-tight mt-0.5 ${c.val}`}>{value}</p>
      </div>
    </div>
  );
}
