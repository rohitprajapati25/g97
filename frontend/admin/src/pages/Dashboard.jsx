import { useEffect, useState } from "react";
import api from "../api/axios";
import { Package, Layers, CalendarCheck } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => alert("Dashboard load failed"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8F9FA]">
        <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 uppercase italic">
            Admin <span className="text-red-600">Dashboard</span>
          </h2>
          <div className="h-1.5 w-20 bg-slate-900 mt-2"></div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SERVICES CARD */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 text-blue-600 p-5 rounded-2xl">
              <Layers size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Services</p>
              <h3 className="text-3xl font-black text-slate-900 italic">
                {data.services}
              </h3>
            </div>
          </div>

          {/* PRODUCTS CARD */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="bg-emerald-50 text-emerald-600 p-5 rounded-2xl">
              <Package size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Products</p>
              <h3 className="text-3xl font-black text-slate-900 italic">
                {data.products}
              </h3>
            </div>
          </div>

          {/* BOOKINGS CARD */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl">
              <CalendarCheck size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Bookings</p>
              <h3 className="text-3xl font-black text-slate-900 italic">
                {data.bookings}
              </h3>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}