
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../api/axios";
import {
  User, LogOut, LayoutDashboard, Calendar,
  ChevronDown, LogIn, ShieldCheck, Bell, X,
  CheckCircle2, XCircle, Clock, Info, ArrowRight,
  Sparkles,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NOTIF_ICON = {
  approved: <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
  rejected: <XCircle     size={15} className="text-red-500    flex-shrink-0 mt-0.5" />,
  info:     <Info        size={15} className="text-blue-500   flex-shrink-0 mt-0.5" />,
  deleted:  <XCircle     size={15} className="text-red-400    flex-shrink-0 mt-0.5" />,
};
const defaultIcon = <Clock size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />;

// ─── Notification Panel ───────────────────────────────────────────────────────
// Renders as a dropdown on desktop, full-screen sheet on mobile
function NotificationPanel({ onClose, onCountChange }) {
  const navigate                          = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread,        setUnread]        = useState(0);
  const [loading,       setLoading]       = useState(true);
  const panelRef                          = useRef(null);
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 640);

  // Track resize so mobile/desktop switch works correctly
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Outside click (desktop only) ──────────────────────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    // slight delay so the bell-button click doesn't immediately close
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [onClose, isMobile]);

  // ── Lock body scroll on mobile ─────────────────────────────────────────────
  useEffect(() => {
    if (isMobile) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile]);

  // ── Mark all seen ──────────────────────────────────────────────────────────
  const markAllSeen = async () => {
    try {
      await api.put("/notifications/mark-all-seen");
      setNotifications((p) => p.map((n) => ({ ...n, status: "seen" })));
      setUnread(0);
      onCountChange(0);
    } catch { /* silent */ }
  };

  // ── Mark single seen ───────────────────────────────────────────────────────
  const markOneSeen = async (id) => {
    try {
      await api.put(`/notifications/${id}/seen`);
      setNotifications((p) =>
        p.map((n) => n._id === id ? { ...n, status: "seen" } : n)
      );
      setUnread((c) => {
        const next = Math.max(0, c - 1);
        onCountChange(next);
        return next;
      });
    } catch { /* silent */ }
  };

  const handleNotifClick = (n) => {
    if (n.status !== "seen") markOneSeen(n._id);
  };

  const handleViewBookings = () => {
    onClose();
    navigate("/user/bookings");
  };

  // ── Shared content ─────────────────────────────────────────────────────────
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
            <Bell size={15} className="text-red-600" />
          </div>
          <div>
            <p className="font-black text-sm text-slate-900 uppercase tracking-widest leading-none">
              Notifications
            </p>
            {unread > 0 && (
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{unread} unread</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAllSeen}
              className="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Bell size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-700 font-black text-sm uppercase italic mb-1">All caught up!</p>
            <p className="text-slate-400 text-xs">No notifications yet. We'll let you know when something happens.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => {
              const isUnread = n.status !== "seen";
              return (
                <div
                  key={n._id}
                  onClick={() => handleNotifClick(n)}
                  className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${
                    isUnread ? "bg-red-50/60 hover:bg-red-50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Type icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {NOTIF_ICON[n.type] || defaultIcon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${
                      isUnread ? "text-slate-900 font-semibold" : "text-slate-600 font-medium"
                    }`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
        <button
          onClick={handleViewBookings}
          className="flex items-center gap-1.5 text-[10px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest transition-colors"
        >
          View all bookings <ArrowRight size={12} />
        </button>
      </div>
    </>
  );

  // ── Mobile: full-screen sheet ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        {/* Sheet slides up from bottom */}
        <div className="relative mt-auto bg-white rounded-t-[2rem] flex flex-col max-h-[85vh] shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          {content}
        </div>
      </div>
    );
  }

  // ── Desktop: dropdown ──────────────────────────────────────────────────────
  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-3 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[150] flex flex-col max-h-[480px]"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
    >
      {content}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const userToken  = localStorage.getItem("userToken");
  const userName   = localStorage.getItem("userName");
  const userEmail  = localStorage.getItem("userEmail");

  const [showProfile,  setShowProfile]  = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [scrolled,     setScrolled]     = useState(false);
  const [isMobileNav,  setIsMobileNav]  = useState(window.innerWidth < 640);
  const dropdownRef = useRef(null);

  // Track viewport for mobile/desktop split
  useEffect(() => {
    const onResize = () => setIsMobileNav(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Scroll detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close profile on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close both panels on route change ─────────────────────────────────────
  useEffect(() => {
    setShowProfile(false);
    setShowNotif(false);
  }, [location.pathname]);

  // ── Fetch unread count on mount + poll every 30s ──────────────────────────
  useEffect(() => {
    if (!userToken) return;
    const fetchCount = () => {
      api.get("/notifications")
        .then((res) => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userToken]);

  const handleLogout = () => {
    ["userToken","userData","userName","userEmail","userPhone"].forEach(
      (k) => localStorage.removeItem(k)
    );
    navigate("/");
    window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const toggleNotif = () => {
    setShowNotif((p) => !p);
    setShowProfile(false);
  };

  const closeNotif = () => setShowNotif(false);

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-black/85 backdrop-blur-xl border-b border-white/8 py-3 shadow-2xl"
          : "bg-transparent py-5 sm:py-7"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

          {/* ── Logo ── */}
          <div onClick={() => navigate("/")} className="flex items-center cursor-pointer group relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <img
              src={logo}
              alt="Auto Hub"
              className="relative h-9 sm:h-11 w-auto object-contain transition duration-500 group-hover:scale-105"
            />
          </div>

          {/* ── Nav links (desktop) ── */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Services", to: "/services" },
              { label: "Store",    to: "/store"    },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="text-zinc-400 hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative group">
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!userToken ? (
              <>
                <Link to="/user/login"
                  className="text-zinc-400 hover:text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5">
                  <LogIn size={14} />
                  <span className="hidden sm:block">Sign In</span>
                </Link>
                <Link to="/Login"
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-red-600/30 transition-all active:scale-95">
                  <ShieldCheck size={13} />
                  <span>Admin</span>
                </Link>
              </>
            ) : (
              <>
                {/* ── Bell button ── */}
                <div className="relative">
                  <button
                    onClick={toggleNotif}
                    aria-label="Notifications"
                    className={`relative p-2 rounded-xl border transition-all ${
                      showNotif
                        ? "bg-zinc-800 border-white/20"
                        : "bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-800"
                    }`}
                  >
                    <Bell size={18} className={showNotif ? "text-white" : "text-zinc-400"} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown (desktop only — mobile renders as portal below) */}
                  {showNotif && !isMobileNav && (
                    <NotificationPanel
                      onClose={closeNotif}
                      onCountChange={setUnreadCount}
                    />
                  )}
                </div>

                {/* ── Profile dropdown ── */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => { setShowProfile((p) => !p); setShowNotif(false); }}
                    className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-red-600/40 hover:bg-zinc-800 transition-all group"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-[10px] font-black shadow-md">
                      {getInitials(userName)}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-zinc-200 text-[10px] font-black uppercase tracking-widest leading-none">
                        {userName?.split(" ")[0] || "Member"}
                      </span>
                      <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-tighter mt-0.5">Member</span>
                    </div>
                    <ChevronDown size={13} className={`text-zinc-500 transition-transform duration-300 ${showProfile ? "rotate-180 text-red-500" : ""}`} />
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-3 w-56 sm:w-64 origin-top-right rounded-2xl bg-[#0d0d0d] border border-white/10 shadow-2xl overflow-hidden z-[110]">
                      {/* User info */}
                      <div className="px-5 py-4 bg-gradient-to-br from-red-600/10 to-transparent border-b border-white/5">
                        <p className="text-white font-black text-xs uppercase tracking-widest leading-none">{userName || "User"}</p>
                        <p className="text-zinc-500 text-[9px] font-bold truncate mt-1.5 uppercase tracking-widest">{userEmail}</p>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <NavBtn icon={<LayoutDashboard size={15}/>} label="Dashboard"  onClick={() => { navigate("/user/dashboard"); setShowProfile(false); }} />
                        <NavBtn icon={<Calendar size={15}/>}        label="My Bookings" onClick={() => { navigate("/user/bookings");  setShowProfile(false); }} />
                        <NavBtn icon={<Sparkles size={15}/>}        label="Services"    onClick={() => { navigate("/services");       setShowProfile(false); }} />
                      </div>
                      <div className="p-2 border-t border-white/5">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center justify-between px-4 py-3 text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all uppercase tracking-widest"
                        >
                          Sign Out <LogOut size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile notification sheet (rendered outside nav to avoid z-index issues) ── */}
      {showNotif && userToken && isMobileNav && (
        <NotificationPanel
          onClose={closeNotif}
          onCountChange={setUnreadCount}
        />
      )}
    </>
  );
}

// ─── NavBtn helper ────────────────────────────────────────────────────────────
const NavBtn = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 px-4 py-3 text-[10px] font-black text-zinc-400 hover:bg-white/5 hover:text-white rounded-xl transition-all group uppercase tracking-widest"
  >
    <span className="text-zinc-600 group-hover:text-red-500 transition-colors">{icon}</span>
    {label}
  </button>
);

export default Navbar;
