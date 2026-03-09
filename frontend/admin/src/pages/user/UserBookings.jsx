
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { X, Calendar, Clock, Car, CheckCircle2, AlertCircle, Timer } from "lucide-react";

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchMyBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      // API returns { total, page, limit, bookings }
      setBookings(res.data.bookings || res.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />

      {/* --- HERO HEADER --- */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase italic">
            My <span className="text-red-600">Appointments</span>
          </h1>
          <p className="text-gray-400 mt-3 text-lg max-w-xl font-medium">
            Track your vehicle's transformation and service history.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 pb-20">
        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 text-center shadow-xl border border-gray-100">
            <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with garage...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-xl border border-gray-100">
            <div className="text-6xl mb-6">🏎️</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Your garage is empty</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">
              Give your car the premium treatment it deserves today.
            </p>
            <button
              onClick={() => (window.location.href = "/services")}
              className="bg-red-600 hover:bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-200"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-500 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Left Color Strip */}
                  <div className={`w-full md:w-2 h-2 md:h-auto ${
                    b.status === "Approved" ? "bg-emerald-500" : b.status === "Rejected" ? "bg-rose-500" : "bg-amber-500"
                  }`}></div>

                  <div className="flex-1 p-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="bg-slate-50 p-4 rounded-2xl text-2xl group-hover:bg-red-50 group-hover:rotate-6 transition-all">
                        🚗
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-900 uppercase italic leading-none mb-1">
                          {b.service}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.carType} • {b.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block">
                        <StatusBadge status={b.status} />
                      </div>
                      {/* --- DETAIL TRIGGER BUTTON --- */}
                      <button 
                        onClick={() => setSelectedBooking(b)}
                        className="p-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm group-hover:scale-110"
                      >
                        <ArrowIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- BOOKING DETAILS MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <p className="text-red-600 font-black uppercase tracking-widest text-[10px] mb-1">Service Details</p>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                  {selectedBooking.service}
                </h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <DetailBox icon={<Calendar size={18}/>} label="Date" value={selectedBooking.date} />
                <DetailBox icon={<Clock size={18}/>} label="Time" value={selectedBooking.time} />
              </div>
              
              <DetailBox icon={<Car size={18}/>} label="Vehicle Type" value={selectedBooking.carType} />
              
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Timer size={14}/> Current Status
                </p>
                <div className="flex items-center justify-between">
                   <StatusBadge status={selectedBooking.status} />
                   <p className="text-[10px] text-slate-400 font-medium italic">Ref ID: {selectedBooking._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBooking(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🔹 HELPER COMPONENTS */
const DetailBox = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-slate-200 transition-colors">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="font-bold text-slate-900 text-sm">{value}</p>
    </div>
  </div>
);

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const StatusBadge = ({ status }) => {
  const base = "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm flex items-center gap-2";

  if (status === "Approved")
    return (
      <span className={`${base} bg-emerald-50 text-emerald-600 border border-emerald-100`}>
        <CheckCircle2 size={12} /> Confirmed
      </span>
    );

  if (status === "Rejected")
    return (
      <span className={`${base} bg-rose-50 text-rose-600 border border-rose-100`}>
        <AlertCircle size={12} /> Cancelled
      </span>
    );

  return (
    <span className={`${base} bg-amber-50 text-amber-600 border border-amber-100 animate-pulse`}>
      <Timer size={12} /> Pending
    </span>
  );
};

export default UserBookings;

