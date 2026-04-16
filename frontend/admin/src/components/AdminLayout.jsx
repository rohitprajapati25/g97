import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu, Bell, CheckCircle2, XCircle, Clock, Info, X } from 'lucide-react';
import api from '../api/axios';

// ─── Admin Notification Panel ─────────────────────────────────────────────────
function AdminNotifPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/bookings?limit=10&status=Pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.bookings || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  // Outside click — desktop only
  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [onClose, isMobile]);

  // Lock body scroll on mobile
  useEffect(() => {
    if (isMobile) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile]);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600/10 rounded-xl flex items-center justify-center">
            <Bell size={15} className="text-red-500" />
          </div>
          <div>
            <span className="font-black text-xs text-white uppercase tracking-widest leading-none block">
              Pending Bookings
            </span>
            {notifications.length > 0 && (
              <span className="text-[9px] text-zinc-500 font-bold mt-0.5 block">
                {notifications.length} awaiting action
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-zinc-400" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 px-6">
            <CheckCircle2 size={28} className="mx-auto text-emerald-600 mb-3" />
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">All caught up!</p>
          </div>
        ) : (
          notifications.map((b) => (
            <div key={b._id} className="flex items-start gap-3 px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock size={14} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold leading-tight truncate">
                  {b.userName} — <span className="text-zinc-400">{b.service}</span>
                </p>
                <p className="text-zinc-500 text-[10px] mt-0.5">
                  {b.date} · {b.time} · {b.carType}
                </p>
                <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest mt-1">
                  {timeAgo(b.createdAt)}
                </p>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg flex-shrink-0">
                Pending
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-zinc-900/50 border-t border-white/5 flex-shrink-0">
        <a href="/bookings" className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">
          Manage all bookings →
        </a>
      </div>
    </>
  );

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative mt-auto bg-zinc-950 border-t border-white/10 rounded-t-[2rem] flex flex-col max-h-[85vh] shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop: dropdown
  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[420px]"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
    >
      {content}
    </div>
  );
}

// ─── Admin Layout ─────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch pending booking count for bell badge
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await api.get("/bookings?limit=1&status=Pending", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingCount(res.data.pagination?.total || 0);
      } catch { /* silent */ }
    };
    fetchPending();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
          <Menu size={22} />
        </button>

        <h1 className="text-white font-black tracking-tighter uppercase italic text-lg">
          Auto<span className="text-red-600">Hub</span>
        </h1>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
          {/* Desktop dropdown only — mobile renders as portal below */}
          {showNotif && window.innerWidth >= 1024 && (
            <AdminNotifPanel onClose={() => setShowNotif(false)} />
          )}
        </div>
      </div>

      {/* DESKTOP HEADER BAR */}
      <div className="hidden lg:flex fixed top-0 left-72 right-0 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 z-30 items-center justify-end px-8 gap-3">
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-600 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>
          {showNotif && <AdminNotifPanel onClose={() => setShowNotif(false)} />}
        </div>
        <div className="h-5 w-px bg-white/10" />
        <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
        <div className="flex-1 p-4 md:p-6 lg:p-8 mt-16 lg:mt-14 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile notification sheet — rendered outside header to avoid z-index clipping */}
      {showNotif && window.innerWidth < 1024 && (
        <AdminNotifPanel onClose={() => setShowNotif(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
