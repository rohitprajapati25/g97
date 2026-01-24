import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  ChevronRight, X, User, Phone, Briefcase, 
  Clock, ShieldCheck, Info, Calendar 
} from "lucide-react"; 

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings");
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
      await api.put(`/bookings/${id}`, { status });
      setSelectedBooking(null); 
      fetchBookings();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const statusColor = (status) => {
    if (status === "Approved") return "bg-emerald-100 text-emerald-700";
    if (status === "Rejected") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase italic">
          Service <span className="text-red-600">Requests</span>
        </h1>
        <p className="text-slate-500 mb-10 font-medium tracking-tight">Manage and review all incoming car care appointments.</p>

        {bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-200 shadow-sm">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Info size={40} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm text-center">No bookings found in the garage</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="group bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                        <User size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none mb-2">
                            {b.userName || b.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-red-600 rounded-full"></span>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{b.service}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusColor(b.status)}`}>
                    {b.status || "Pending"}
                  </span>
                  
                  <button 
                    onClick={() => setSelectedBooking(b)}
                    className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- PREMIUM MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSelectedBooking(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-10 bg-slate-900 text-white relative">
                <button 
                    onClick={() => setSelectedBooking(null)}
                    className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>
                <div className="bg-red-600 w-12 h-1.5 rounded-full mb-4"></div>
                <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">
                    {selectedBooking.userName || selectedBooking.name}
                </h2>
                <p className="text-slate-400 text-xs font-bold mt-2 tracking-widest uppercase italic">Customer Details</p>
            </div>

            {/* Modal Content */}
            <div className="p-10 space-y-6">
                
                {/* Service Type Card */}
                <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl">
                    <div className="p-3 bg-white rounded-xl text-red-600 shadow-sm"><Briefcase size={20}/></div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Selected Service</p>
                        <p className="font-black text-slate-900 text-lg italic uppercase">{selectedBooking.service}</p>
                    </div>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl">
                        <Calendar size={18} className="text-slate-400" />
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase">Date</p>
                            <p className="text-xs font-bold text-slate-800">{selectedBooking.date || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl">
                        <Clock size={18} className="text-slate-400" />
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase">Time Slot</p>
                            <p className="text-xs font-bold text-slate-800">{selectedBooking.time || "N/A"}</p>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-5 p-4 border border-gray-100 rounded-2xl">
                    <Phone size={18} className="text-slate-400"/>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Phone Number</p>
                        <p className="text-sm font-bold text-slate-900">{selectedBooking.phone || "Not Provided"}</p>
                    </div>
                </div>

                {/* Status Section */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-slate-400"/>
                        <p className="text-[10px] font-black text-gray-400 uppercase">Status</p>
                    </div>
                    <p className={`font-black text-[10px] uppercase px-3 py-1 rounded-lg ${statusColor(selectedBooking.status)}`}>
                        {selectedBooking.status || "Pending"}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => updateStatus(selectedBooking._id, "Approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-emerald-100"
                    >
                        Approve Booking
                    </button>
                    <button
                        onClick={() => updateStatus(selectedBooking._id, "Rejected")}
                        className="bg-slate-900 hover:bg-red-600 text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-slate-200"
                    >
                        Reject
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