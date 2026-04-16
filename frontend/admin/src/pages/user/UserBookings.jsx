
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import {
  X, Calendar, Clock, Car, CheckCircle2, AlertCircle,
  Timer, ChevronRight, Sparkles, RefreshCw, ArrowRight,
  CalendarCheck, Hash, Wrench, ChevronDown, ArrowLeft,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const STATUS = {
  Confirmed: {
    pill:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    strip: "bg-emerald-500",
    icon:  <CheckCircle2 size={11} />,
    glow:  "shadow-emerald-100",
  },
  Completed: {
    pill:  "bg-blue-50 text-blue-700 border-blue-200",
    strip: "bg-blue-500",
    icon:  <CheckCircle2 size={11} />,
    glow:  "shadow-blue-100",
  },
  Pending: {
    pill:  "bg-amber-50 text-amber-700 border-amber-200",
    strip: "bg-amber-400",
    icon:  <Timer size={11} />,
    glow:  "shadow-amber-100",
  },
  Cancelled: {
    pill:  "bg-red-50 text-red-600 border-red-200",
    strip: "bg-red-500",
    icon:  <AlertCircle size={11} />,
    glow:  "shadow-red-100",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${s.pill}`}>
      {s.icon} {status}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-400">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-slate-900 font-bold text-sm mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserBookings() {
  const navigate = useNavigate();

  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [selected,  setSelected]  = useState(null);   // detail modal
  const [filter,    setFilter]    = useState("All");
  const [sortDesc,  setSortDesc]  = useState(true);   // newest first

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data.bookings || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openModal  = (b) => { setSelected(b); document.body.style.overflow = "hidden"; };
  const closeModal = ()  => { setSelected(null); document.body.style.overflow = "auto"; };

  // ── Derived data ───────────────────────────────────────────────────────────
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All"
      ? bookings.length
      : bookings.filter((b) => b.status === f).length;
    return acc;
  }, {});

  const upcoming  = (counts.Pending  || 0) + (counts.Confirmed || 0);
  const completed = counts.Completed || 0;

  const filtered = (filter === "All" ? bookings : bookings.filter((b) => b.status === filter))
    .slice()
    .sort((a, b) => {
      const da = new Date(a.date + "T" + (a.time || "00:00"));
      const db = new Date(b.date + "T" + (b.time || "00:00"));
      return sortDesc ? db - da : da - db;
    });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F2F4F7]">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 pt-24 sm:pt-28 pb-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/8 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Back nav */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-6 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Service History</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                My <span className="text-red-500">Appointments</span>
              </h1>
              <p className="text-zinc-500 text-sm mt-3 max-w-sm">
                Track every service, confirm your slots, and review your vehicle's care history.
              </p>
            </div>

            {/* Hero stat pills */}
            {!loading && (
              <div className="flex flex-wrap gap-2">
                <StatPill icon={<CalendarCheck size={13} className="text-red-400" />}
                  value={bookings.length} label="Total" />
                <StatPill icon={<Timer size={13} className="text-amber-400" />}
                  value={upcoming} label="Upcoming" />
                <StatPill icon={<CheckCircle2 size={13} className="text-emerald-400" />}
                  value={completed} label="Done" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CONTENT — overlaps hero
      ══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-20 relative z-10 space-y-4">

        {/* ── Toolbar: filters + sort + refresh ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-2">
          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 ${
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }`}>
                {f}
                {counts[f] > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    filter === f ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>{counts[f]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Sort + Refresh */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setSortDesc((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all border border-slate-100">
              <ChevronDown size={12} className={`transition-transform ${sortDesc ? "" : "rotate-180"}`} />
              {sortDesc ? "Newest" : "Oldest"}
            </button>
            <button onClick={loadBookings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-100">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 h-20 animate-pulse" />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
            <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
            <p className="text-slate-700 font-black uppercase italic text-base mb-1">Failed to load</p>
            <p className="text-slate-400 text-sm mb-5">{error}</p>
            <button onClick={loadBookings}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty (no bookings at all) ── */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="text-6xl mb-5">🏎️</div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Your garage is empty</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
              Give your car the premium treatment it deserves today.
            </p>
            <button onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-100">
              <Sparkles size={14} /> Book Now
            </button>
          </div>
        )}

        {/* ── Empty filter result ── */}
        {!loading && !error && bookings.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-slate-700 font-black uppercase italic text-lg mb-1">No {filter} bookings</p>
            <p className="text-slate-400 text-sm">Try a different filter.</p>
          </div>
        )}

        {/* ── Booking Cards ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((b) => {
              const s = STATUS[b.status] || STATUS.Pending;
              return (
                <div key={b._id} onClick={() => openModal(b)}
                  className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${s.glow}`}>
                  <div className="flex">
                    {/* Left status strip */}
                    <div className={`w-1 flex-shrink-0 ${s.strip}`} />

                    <div className="flex-1 flex items-center gap-4 p-4 sm:p-5">
                      {/* Service image */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                        <img
                          src={b.serviceImage || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330?w=120&h=120&fit=crop"}
                          alt={b.service}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-black text-slate-900 uppercase italic text-sm sm:text-base leading-tight truncate">
                            {b.service}
                          </h3>
                          {/* Status badge — always visible */}
                          <StatusBadge status={b.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                          <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Car size={9} /> {b.carType}
                          </span>
                          <span className="text-slate-200 text-xs">·</span>
                          <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Calendar size={9} /> {fmtDate(b.date)}
                          </span>
                          <span className="text-slate-200 text-xs">·</span>
                          <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={9} /> {fmt12(b.time)}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="w-8 h-8 bg-slate-50 group-hover:bg-slate-900 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
                        <ChevronRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Book Again CTA ── */}
        {!loading && bookings.length > 0 && (
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5 p-6 sm:p-8">
              <div>
                <p className="text-red-400 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Premium Detailing</p>
                <p className="text-white font-black text-lg uppercase italic tracking-tight">Need another service?</p>
                <p className="text-zinc-500 text-xs mt-1">Browse our full menu of premium detailing packages.</p>
              </div>
              <button onClick={() => navigate("/services")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white px-7 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-900/30 flex-shrink-0">
                Book Again <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeModal} />

          {/* Sheet */}
          <div className="relative bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden">

            {/* ── Image header ── */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={selected.serviceImage || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330?w=600&h=300&fit=crop"}
                alt={selected.service}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

              {/* Close */}
              <button onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center transition-colors">
                <X size={16} className="text-white" />
              </button>

              {/* Title overlay */}
              <div className="absolute bottom-4 left-5 right-14">
                <p className="text-red-400 text-[9px] font-black uppercase tracking-[0.3em] mb-0.5">Booking Details</p>
                <h2 className="text-white font-black text-xl uppercase italic tracking-tighter leading-tight truncate">
                  {selected.service}
                </h2>
              </div>
            </div>

            {/* ── Status bar ── */}
            <div className={`px-5 py-2.5 flex items-center justify-between ${
              selected.status === "Confirmed" ? "bg-emerald-50" :
              selected.status === "Completed" ? "bg-blue-50" :
              selected.status === "Cancelled" ? "bg-red-50" : "bg-amber-50"
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${STATUS[selected.status]?.strip || "bg-amber-400"}`} />
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Status</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {/* ── Body ── */}
            <div className="px-5 py-4">
              <InfoRow icon={<Calendar size={15} />}  label="Date"         value={fmtDate(selected.date)} />
              <InfoRow icon={<Clock size={15} />}     label="Time"         value={fmt12(selected.time)} />
              <InfoRow icon={<Car size={15} />}       label="Vehicle Type" value={selected.carType} />
              {selected.duration && (
                <InfoRow icon={<Wrench size={15} />}  label="Duration"     value={selected.duration} />
              )}
              <InfoRow icon={<Hash size={15} />}      label="Booking Ref"  value={`#${selected._id?.slice(-8).toUpperCase()}`} />
            </div>

            {/* ── Booked on ── */}
            {selected.createdAt && (
              <div className="px-5 pb-1">
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                  Booked {timeAgo(selected.createdAt)}
                </p>
              </div>
            )}

            {/* ── Actions ── */}
            <div className="p-5 pt-3 flex gap-3">
              <button onClick={closeModal}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all">
                Close
              </button>
              {selected.status !== "Cancelled" && selected.status !== "Completed" ? (
                <button
                  onClick={() => { closeModal(); navigate("/services"); }}
                  className="flex-1 py-3 bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> Book Again
                </button>
              ) : (
                <button
                  onClick={() => { closeModal(); navigate("/services"); }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> Rebook
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StatPill (hero) ──────────────────────────────────────────────────────────
const StatPill = ({ icon, value, label }) => (
  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
    {icon}
    <span className="text-white font-black text-sm">{value}</span>
    <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </div>
);
