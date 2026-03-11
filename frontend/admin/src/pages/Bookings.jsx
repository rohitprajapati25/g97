import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  ChevronRight, X, User, Phone, Briefcase, 
  Clock, Calendar, Sparkles, CheckCircle2, XCircle,
  Search, Filter, Edit2, Trash2, Car
} from "lucide-react"; 

// Convert 24-hour to 12-hour format for display
const convertTo12Hour = (time24) => {
  if (!time24) return time24;
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Convert 12-hour to 24-hour for storage
const convertTo24Hour = (time12h) => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(/(?=[AP]M)/i);
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (hours === 12) hours = 0;
  if (modifier.toUpperCase() === 'PM') hours += 12;
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Generate time slots for dropdown
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    const h = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h;
    slots.push(`${displayHour}:00 ${ampm}`);
    if (hour < 18) {
      slots.push(`${displayHour}:30 ${ampm}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);
      
      const res = await api.get(`/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter, dateFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("");
    fetchBookings();
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await api.put(`/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedBooking(null); 
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Status update failed. Please check your connection.");
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/bookings/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking.");
    }
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const updateData = {
        date: selectedBooking.date,
        time: selectedBooking.time,
        service: selectedBooking.service,
        carType: selectedBooking.carType,
        userName: selectedBooking.userName,
        phone: selectedBooking.phone,
        status: selectedBooking.status
      };
      
      await api.put(`/bookings/edit/${selectedBooking._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsEditing(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to update booking.");
    }
  };

  const statusColor = (status) => {
    if (status === "Approved" || status === "Completed") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (status === "Rejected" || status === "Cancelled") return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  };

  return (
    <div className="p-8 bg-darkbg min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <Sparkles size={16} className="animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Appointment Desk</p>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Service <span className="text-red-600">Requests</span>
          </h1>
          <div className="h-1 w-24 bg-red-600 mt-4 rounded-full"></div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 mb-8 backdrop-blur-sm">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by name, phone, service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-600/50"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                Status
              </label>
              <div className="relative">
                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-red-600/50"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div className="w-48">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                Date
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-600/50"
                />
              </div>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 bg-zinc-800 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
            >
              Clear
            </button>
          </form>
          
          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
              Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* BOOKINGS LIST */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-zinc-900/40 p-24 rounded-[3rem] text-center border border-white/5 backdrop-blur-xl">
             <div className="bg-zinc-950 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 text-zinc-800 border border-white/5">
                <Sparkles size={40} />
             </div>
             <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">No bookings found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="group bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 hover:border-red-600/30 transition-all duration-500 flex items-center justify-between backdrop-blur-sm"
              >
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center text-zinc-700 group-hover:text-red-600 group-hover:border-red-600/20 transition-all duration-500">
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase italic leading-none mb-2 tracking-tight">
                            {b.userName || b.name}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 bg-red-600 rounded-full"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] italic">{b.service}</p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-6">
                  {/* Date */}
                  <div className="text-center px-4">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-bold text-zinc-300">{b.date || "N/A"}</p>
                  </div>
                  
                  {/* Time */}
                  <div className="text-center px-4">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Time</p>
                    <p className="text-sm font-bold text-zinc-300">{convertTo12Hour(b.time) || "N/A"}</p>
                  </div>
                  
                  {/* Status */}
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusColor(b.status)}`}>
                    {b.status || "Pending"}
                  </span>
                  
                  <button 
                    onClick={() => setSelectedBooking(b)}
                    className="h-12 w-12 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- DETAIL/EDIT MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => { setSelectedBooking(null); setIsEditing(false); }}
          ></div>
          
          <div className="relative bg-darknav w-full max-w-lg rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-10 bg-zinc-900/50 border-b border-white/5 sticky top-0 z-10">
                <button 
                    onClick={() => { setSelectedBooking(null); setIsEditing(false); }}
                    className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>
                <div className="bg-red-600 w-12 h-1 rounded-full mb-4"></div>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black uppercase italic tracking-tight text-white">
                    {isEditing ? "Edit Booking" : selectedBooking.userName}
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>
                <p className="text-zinc-500 text-[10px] font-black mt-2 tracking-[0.3em] uppercase italic">
                  {isEditing ? "Modify booking details" : "Booking Specification"}
                </p>
            </div>

            {/* Modal Content */}
            <div className="p-10 space-y-6">
                
                {/* User Name */}
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Customer Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={selectedBooking.userName || ""}
                      onChange={(e) => setSelectedBooking({...selectedBooking, userName: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                    />
                  ) : (
                    <p className="font-black text-xl text-white">{selectedBooking.userName}</p>
                  )}
                </div>

                {/* Service */}
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Service</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={selectedBooking.service || ""}
                      onChange={(e) => setSelectedBooking({...selectedBooking, service: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-2xl border border-white/5">
                      <Briefcase size={20} className="text-red-600" />
                      <p className="font-black text-lg text-white">{selectedBooking.service}</p>
                    </div>
                  )}
                </div>

                {/* Car Type */}
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Car Type</label>
                  {isEditing ? (
                    <select
                      value={selectedBooking.carType || ""}
                      onChange={(e) => setSelectedBooking({...selectedBooking, carType: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                    >
                      <option value="Hatchback">Hatchback</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-2xl border border-white/5">
                      <Car size={20} className="text-zinc-500" />
                      <p className="font-bold text-lg text-zinc-300">{selectedBooking.carType}</p>
                    </div>
                  )}
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={selectedBooking.date || ""}
                          onChange={(e) => setSelectedBooking({...selectedBooking, date: e.target.value})}
                          className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-zinc-950/50 rounded-xl">
                          <Calendar size={16} className="text-zinc-500" />
                          <p className="font-bold text-zinc-200">{selectedBooking.date}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Time</label>
                      {isEditing ? (
                        <input
                          type="time"
                          value={selectedBooking.time || ""}
                          onChange={(e) => setSelectedBooking({...selectedBooking, time: e.target.value})}
                          className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-zinc-950/50 rounded-xl">
                          <Clock size={16} className="text-zinc-500" />
                          <p className="font-bold text-zinc-200">{convertTo12Hour(selectedBooking.time)}</p>
                        </div>
                      )}
                    </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={selectedBooking.phone || ""}
                      onChange={(e) => setSelectedBooking({...selectedBooking, phone: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-zinc-950/50 rounded-xl">
                      <Phone size={16} className="text-zinc-500"/>
                      <p className="font-bold text-zinc-200 tracking-widest">{selectedBooking.phone}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Status</label>
                  {isEditing ? (
                    <select
                      value={selectedBooking.status || "Pending"}
                      onChange={(e) => setSelectedBooking({...selectedBooking, status: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-red-600/50"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`inline-block px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${statusColor(selectedBooking.status)}`}>
                      {selectedBooking.status || "Pending"}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-6 space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={saveEdit}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                        >
                            <CheckCircle2 size={18} /> Save Changes
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                        >
                            Cancel Edit
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateStatus(selectedBooking._id, "Approved")}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                        >
                            <CheckCircle2 size={18} /> Approve
                        </button>
                        <button
                            onClick={() => updateStatus(selectedBooking._id, "Rejected")}
                            className="flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                        >
                            <XCircle size={18} /> Reject
                        </button>
                      </div>
                      
                      {/* Delete/Cancel Button */}
                      <button
                          onClick={() => deleteBooking(selectedBooking._id)}
                          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-red-900/50 border border-red-500/30 text-red-500 hover:text-red-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                      >
                          <Trash2 size={18} /> Cancel Booking
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

export default Bookings;

