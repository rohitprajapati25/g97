import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  ChevronRight, X, User, Phone, Briefcase, 
  Clock, ShieldCheck, Info, Calendar, Sparkles, CheckCircle2, XCircle
} from "lucide-react"; 

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await api.put(`/bookings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedBooking(null); 
      fetchBookings();
    } catch (err) {
      alert("Status update failed. Please check your connection.");
    }
  };

  const statusColor = (status) => {
    if (status === "Approved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (status === "Rejected") return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  };

  return (
    <div className="p-8 bg-[#050507] min-h-screen text-white font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <Sparkles size={16} className="animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Appointment Desk</p>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Service <span className="text-red-600">Requests</span>
          </h1>
          <div className="h-1 w-24 bg-red-600 mt-4 rounded-full"></div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-zinc-900/40 p-24 rounded-[3rem] text-center border border-white/5 backdrop-blur-xl">
             <div className="bg-zinc-950 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 text-zinc-800 border border-white/5">
                <Info size={40} />
             </div>
             <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs">No active bookings in the studio</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="group bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-red-600/30 transition-all duration-500 flex items-center justify-between backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-8">
                    <div className="h-20 w-20 bg-zinc-950 rounded-3xl border border-white/5 flex items-center justify-center text-zinc-700 group-hover:text-red-600 group-hover:border-red-600/20 transition-all duration-500">
                        <User size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase italic leading-none mb-3 tracking-tighter">
                            {b.userName || b.name}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] italic">{b.service}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${statusColor(b.status)}`}>
                    {b.status || "Pending"}
                  </span>
                  
                  <button 
                    onClick={() => setSelectedBooking(b)}
                    className="h-14 w-14 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl"
                  >
                    <ChevronRight size={28} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- PREMIUM STUDIO MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedBooking(null)}
          ></div>
          
          <div className="relative bg-[#0a0a0c] w-full max-w-lg rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-12 bg-zinc-900/50 border-b border-white/5 relative">
                <button 
                    onClick={() => setSelectedBooking(null)}
                    className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"
                >
                    <X size={32} />
                </button>
                <div className="bg-red-600 w-16 h-1.5 rounded-full mb-6"></div>
                <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-white">
                    {selectedBooking.userName || selectedBooking.name}
                </h2>
                <p className="text-zinc-500 text-[10px] font-black mt-3 tracking-[0.3em] uppercase italic">Booking Specification</p>
            </div>

            {/* Modal Content */}
            <div className="p-12 space-y-8">
                
                {/* Service Detail */}
                <div className="flex items-center gap-6 p-6 bg-zinc-950 rounded-[2rem] border border-white/5">
                    <div className="p-4 bg-red-600/10 rounded-2xl text-red-600"><Briefcase size={24}/></div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Requested Detailing</p>
                        <p className="font-black text-white text-xl italic uppercase tracking-tight">{selectedBooking.service}</p>
                    </div>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-5 bg-zinc-950/50 border border-white/5 rounded-[1.5rem]">
                        <Calendar size={20} className="text-zinc-500" />
                        <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Studio Date</p>
                            <p className="text-sm font-bold text-zinc-200">{selectedBooking.date || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-zinc-950/50 border border-white/5 rounded-[1.5rem]">
                        <Clock size={20} className="text-zinc-500" />
                        <div>
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Time Slot</p>
                            <p className="text-sm font-bold text-zinc-200">{selectedBooking.time || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-6 p-6 bg-zinc-950/50 border border-white/5 rounded-[1.5rem]">
                    <Phone size={20} className="text-zinc-500"/>
                    <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Contact Line</p>
                        <p className="text-lg font-black text-white tracking-widest">{selectedBooking.phone || "Not Provided"}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 grid grid-cols-2 gap-6">
                    <button
                        onClick={() => updateStatus(selectedBooking._id, "Approved")}
                        className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                    >
                        <CheckCircle2 size={18} /> Approve
                    </button>
                    <button
                        onClick={() => updateStatus(selectedBooking._id, "Rejected")}
                        className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-red-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all"
                    >
                        <XCircle size={18} /> Reject
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;