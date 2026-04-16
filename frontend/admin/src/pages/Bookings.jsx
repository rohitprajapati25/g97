
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import {
  ChevronRight, X, User, Phone, Briefcase,
  Clock, Calendar, Sparkles, CheckCircle2, XCircle,
  Edit2, Trash2, Car, Search, Filter, RefreshCw,
  ChevronLeft, Timer,
} from "lucide-react";
import { BookingRowSkeleton, ErrorState } from "../components/Skeleton";

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

const STATUS_STYLE = {
  Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STRIP = {
  Confirmed: "bg-emerald-500",
  Completed: "bg-blue-500",
  Pending:   "bg-amber-400",
  Cancelled: "bg-red-500",
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_STYLE[status] || STATUS_STYLE.Pending}`}>
    {status || "Pending"}
  </span>
);

const LIMIT = 15;

function Bookings() {
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [bookings,        setBookings]        = useState([]);
  const [pagination,      setPagination]      = useState({});
  const [currentPage,     setCurrentPage]     = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing,       setIsEditing]       = useState(false);
  const [editData,        setEditData]        = useState({});   // isolated edit copy
  const [savingEdit,      setSavingEdit]      = useState(false);
  const [updatingStatus,  setUpdatingStatus]  = useState(null); // id being updated

  // Filters
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("");
  const [dateFrom,  setDateFrom]  = useState("");
  const [service,   setService]   = useState("");

  // Debounce search
  const searchTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status   && { status }),
        ...(dateFrom && { dateFrom }),
        ...(service  && { service }),
      };
      const res = await api.get("/bookings", { params });
      setBookings(res.data.bookings || []);
      setPagination(res.data.pagination || {});
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, dateFrom, service]);

  // Re-fetch when filters change (debounced search included)
  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  const clearFilters = () => {
    setSearch(""); setDebouncedSearch("");
    setStatus(""); setDateFrom(""); setService("");
  };

  const hasFilters = debouncedSearch || status || dateFrom || service;

  // ── Status update ──────────────────────────────────────────────────────────
  const updateStatus = useCallback(async (id, newStatus) => {
    setUpdatingStatus(id);
    try {
      await api.put(`/bookings/${id}`, { status: newStatus });
      if (window.toast) window.toast("success", "Updated", `Marked as ${newStatus}`);
      setSelectedBooking(null);
      fetchBookings(currentPage);
    } catch (err) {
      if (window.toast) window.toast("error", "Error", err.response?.data?.message || "Update failed");
    } finally {
      setUpdatingStatus(null);
    }
  }, [currentPage, fetchBookings]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteBooking = useCallback(async (id) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await api.delete(`/bookings/admin/${id}`);
      if (window.toast) window.toast("success", "Deleted", "Booking removed");
      setSelectedBooking(null);
      fetchBookings(currentPage);
    } catch (err) {
      if (window.toast) window.toast("error", "Error", err.response?.data?.message || "Delete failed");
    }
  }, [currentPage, fetchBookings]);

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (b) => {
    setEditData({ ...b });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = {
        date:     editData.date,
        time:     editData.time,
        service:  editData.service,
        carType:  editData.carType,
        userName: editData.userName,
        phone:    editData.phone,
        status:   editData.status,
      };
      await api.put(`/bookings/edit/${editData._id}`, payload);
      if (window.toast) window.toast("success", "Saved", "Booking updated");
      setIsEditing(false);
      setSelectedBooking({ ...selectedBooking, ...payload });
      fetchBookings(currentPage);
    } catch (err) {
      if (window.toast) window.toast("error", "Error", err.response?.data?.message || "Save failed");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Open / close modal ─────────────────────────────────────────────────────
  const openModal = (b) => {
    setSelectedBooking(b);
    setIsEditing(false);
    setEditData({});
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setSelectedBooking(null);
    setIsEditing(false);
    setEditData({});
    document.body.style.overflow = "auto";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-darkbg min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-red-600 animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Appointment Desk</p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter">
              Service <span className="text-red-600">Requests</span>
            </h1>
            {pagination.total > 0 && (
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest pb-1">
                {pagination.total} bookings
              </p>
            )}
          </div>
          <div className="h-1 w-16 bg-red-600 mt-3 rounded-full" />
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-zinc-900/60 border border-white/8 rounded-2xl p-4 space-y-3 backdrop-blur">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Name, phone, service…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:border-red-500/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500/50 focus:outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Date */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500/50 focus:outline-none transition-colors"
            />

            {/* Service name */}
            <input
              type="text"
              placeholder="Service name…"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:border-red-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => fetchBookings(1)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
              <Filter size={12} /> Apply
            </button>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                <X size={12} /> Clear
              </button>
            )}
            <button onClick={() => fetchBookings(currentPage)}
              className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors ml-auto">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && !loading && <ErrorState message={error} onRetry={() => fetchBookings(1)} />}

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <BookingRowSkeleton key={i} />)}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/5">
              <Sparkles size={32} className="text-zinc-700" />
            </div>
            <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">
              {hasFilters ? "No bookings match your filters" : "No bookings yet"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters}
                className="mt-4 text-red-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Booking List ── */}
        {!loading && !error && bookings.length > 0 && (
          <>
            <div className="space-y-2">
              {bookings.map((b) => (
                <div key={b._id}
                  className="group bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-red-600/20 transition-all duration-300 cursor-pointer"
                  onClick={() => openModal(b)}>
                  <div className="flex">
                    {/* Status strip */}
                    <div className={`w-1 flex-shrink-0 ${STRIP[b.status] || "bg-zinc-700"}`} />

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                      {/* Customer info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-600/10 transition-colors">
                          <User size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-black text-sm uppercase italic truncate">{b.userName}</p>
                          <p className="text-zinc-500 text-[10px] font-bold flex items-center gap-1 mt-0.5">
                            <Phone size={9} /> {b.phone}
                          </p>
                        </div>
                      </div>

                      {/* Service + meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 flex-1 min-w-0 sm:justify-center">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                          <Briefcase size={10} className="text-red-500" />
                          <span className="truncate max-w-[120px]">{b.service}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          <Car size={10} /> {b.carType}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          <Calendar size={10} /> {fmtDate(b.date)}
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          <Clock size={10} /> {fmt12(b.time)}
                        </div>
                      </div>

                      {/* Status + arrow */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <StatusBadge status={b.status} />
                        <div className="w-8 h-8 bg-zinc-800 group-hover:bg-red-600 rounded-xl flex items-center justify-center transition-all">
                          <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={() => fetchBookings(currentPage - 1)} disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 hover:border-red-600/40 transition-all">
                  <ChevronLeft size={13} /> Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => fetchBookings(p)}
                        className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all ${
                          p === currentPage
                            ? "bg-red-600 text-white"
                            : "text-zinc-500 hover:bg-zinc-800"
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                  {pagination.pages > 7 && (
                    <span className="text-zinc-600 text-xs px-1">…{pagination.pages}</span>
                  )}
                </div>
                <button onClick={() => fetchBookings(currentPage + 1)} disabled={currentPage >= pagination.pages}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 font-black uppercase tracking-widest text-[10px] disabled:opacity-30 hover:border-red-600/40 transition-all">
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DETAIL / EDIT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={closeModal} />

          <div className="relative bg-zinc-950 border border-white/8 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

            {/* ── Modal Header ── */}
            <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <div className="w-10 h-1 bg-red-600 rounded-full mb-3" />
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                  {isEditing ? "Edit Booking" : (selectedBooking.userName || "Booking")}
                </h2>
                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">
                  {isEditing ? "Modify booking details" : `Ref #${selectedBooking._id?.slice(-8).toUpperCase()}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditing && (
                  <button onClick={() => startEdit(selectedBooking)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
                    <Edit2 size={12} /> Edit
                  </button>
                )}
                <button onClick={closeModal}
                  className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center transition-colors">
                  <X size={16} className="text-zinc-400" />
                </button>
              </div>
            </div>

            {/* ── Modal Body ── */}
            <div className="p-6 space-y-5">

              {/* Customer Name */}
              <Field label="Customer Name" icon={<User size={14}/>}>
                {isEditing
                  ? <Input value={editData.userName || ""} onChange={(v) => setEditData({...editData, userName: v})} />
                  : <Value>{selectedBooking.userName}</Value>}
              </Field>

              {/* Phone */}
              <Field label="Phone" icon={<Phone size={14}/>}>
                {isEditing
                  ? <Input type="tel" value={editData.phone || ""} onChange={(v) => setEditData({...editData, phone: v})} />
                  : <Value mono>{selectedBooking.phone}</Value>}
              </Field>

              {/* Service */}
              <Field label="Service" icon={<Briefcase size={14}/>}>
                {isEditing
                  ? <Input value={editData.service || ""} onChange={(v) => setEditData({...editData, service: v})} />
                  : <Value>{selectedBooking.service}</Value>}
              </Field>

              {/* Car Type */}
              <Field label="Vehicle Type" icon={<Car size={14}/>}>
                {isEditing
                  ? (
                    <select value={editData.carType || ""} onChange={(e) => setEditData({...editData, carType: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500/50 focus:outline-none">
                      {["Hatchback","Sedan","SUV","Luxury"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  )
                  : <Value>{selectedBooking.carType}</Value>}
              </Field>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" icon={<Calendar size={14}/>}>
                  {isEditing
                    ? <Input type="date" value={editData.date || ""} onChange={(v) => setEditData({...editData, date: v})} />
                    : <Value>{fmtDate(selectedBooking.date)}</Value>}
                </Field>
                <Field label="Time" icon={<Clock size={14}/>}>
                  {isEditing
                    ? <Input type="time" value={editData.time || ""} onChange={(v) => setEditData({...editData, time: v})} />
                    : <Value>{fmt12(selectedBooking.time)}</Value>}
                </Field>
              </div>

              {/* Status */}
              <Field label="Status" icon={<Timer size={14}/>}>
                {isEditing
                  ? (
                    <select value={editData.status || "Pending"} onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500/50 focus:outline-none">
                      {["Pending","Confirmed","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  )
                  : <StatusBadge status={selectedBooking.status} />}
              </Field>

              {/* ── Action Buttons ── */}
              <div className="pt-2 space-y-3">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={saveEdit} disabled={savingEdit}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                      {savingEdit
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><CheckCircle2 size={15}/> Save</>}
                    </button>
                    <button onClick={cancelEdit}
                      className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                      <X size={15}/> Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Quick status actions — only show relevant ones */}
                    <div className="grid grid-cols-2 gap-3">
                      {selectedBooking.status !== "Confirmed" && selectedBooking.status !== "Completed" && (
                        <button onClick={() => updateStatus(selectedBooking._id, "Confirmed")}
                          disabled={updatingStatus === selectedBooking._id}
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                          <CheckCircle2 size={15}/> Confirm
                        </button>
                      )}
                      {selectedBooking.status !== "Cancelled" && (
                        <button onClick={() => updateStatus(selectedBooking._id, "Cancelled")}
                          disabled={updatingStatus === selectedBooking._id}
                          className="flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                          <XCircle size={15}/> Cancel
                        </button>
                      )}
                    </div>
                    {selectedBooking.status !== "Completed" && (
                      <button onClick={() => updateStatus(selectedBooking._id, "Completed")}
                        disabled={updatingStatus === selectedBooking._id}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                        <CheckCircle2 size={15}/> Mark Completed
                      </button>
                    )}
                    <button onClick={() => deleteBooking(selectedBooking._id)}
                      className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-red-900/20 border border-red-500/20 hover:border-red-500/40 text-red-500 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">
                      <Trash2 size={15}/> Delete Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field / Input / Value helpers ───────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">
      <span className="text-zinc-600">{icon}</span> {label}
    </label>
    {children}
  </div>
);

const Input = ({ type = "text", value, onChange, ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500/50 focus:outline-none transition-colors"
    {...rest}
  />
);

const Value = ({ children, mono }) => (
  <p className={`text-white font-bold text-sm ${mono ? "font-mono tracking-widest" : ""}`}>
    {children || "—"}
  </p>
);

export default Bookings;
