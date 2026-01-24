import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { CalendarCheck, LayoutGrid, ArrowRight, UserCircle } from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Member";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        
        {/* --- MINIMAL HEADER --- */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Hello, <span className="text-red-600">{userName}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">What would you like to do today?</p>
          </div>
          <div className="hidden md:block">
             <UserCircle size={48} className="text-slate-200" />
          </div>
        </div>

        {/* --- MAIN ACTIONS (Only 2 Clean Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Action 1: Book Service */}
          <div
            onClick={() => navigate("/services")}
            className="group bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:border-red-500 transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
              <LayoutGrid size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Book Service</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Select from our premium detailing, coating, and wash packages.
            </p>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest">
              Get Started <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

          {/* Action 2: My Bookings */}
          <div
            onClick={() => navigate("/user/bookings")}
            className="group bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:border-slate-900 transition-all duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <CalendarCheck size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">My Bookings</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Track your current appointments and view your service history.
            </p>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest">
              View Appointments <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

        </div>

        {/* --- QUICK SUPPORT (Minimal) --- */}
        <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-300 font-medium">Have questions about your car's treatment?</p>
          <button className="text-white border border-slate-700 px-6 py-3 rounded-xl hover:bg-white hover:text-black transition-all text-xs font-bold uppercase tracking-widest">
            Contact Support
          </button>
        </div>

      </main>
    </div>
  );
}