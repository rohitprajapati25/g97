import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Trash2, Wrench, Clock, IndianRupee, Sparkles } from "lucide-react";

function Services() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", price: "", duration: "" });
  const [imageFile, setImageFile] = useState(null);
  const BASE_URL = "http://localhost:5000";

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/services", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };
  const handleImageChange = (e) => { setImageFile(e.target.files[0]); };

  const addService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    formData.append("image", imageFile);

    try {
      await api.post("/services", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });
      setForm({ title: "", description: "", price: "", duration: "" });
      setImageFile(null);
      fetchServices();
    } catch (err) {
      alert("Error adding service. Check if you are logged in.");
    }
  };

  // 🔥 FIXED DELETE FUNCTION
  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      // Header bhejna zaroori hai warna server 401 Unauthorized dega
      await api.delete(`/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // State se turant hatane ke liye (Faster UI)
      setServices(services.filter(service => service._id !== id));
      alert("Service deleted successfully");
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Delete failed: Server error or Unauthorized");
    }
  };

  return (
    <div className="p-8 bg-[#050507] min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <Sparkles size={16} className="animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Studio Management</p>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Service <span className="text-red-600">Menu</span>
          </h1>
        </div>

        {/* ADD SERVICE FORM (Sleek Design) */}
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 mb-12 backdrop-blur-xl">
          <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Service Title" className="bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 transition-all font-bold" required />
            <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g. 2 hrs)" className="bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 transition-all font-bold" required />
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price (₹)" className="bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 transition-all font-bold" required />
            <input type="file" onChange={handleImageChange} className="text-[10px] text-zinc-500 file:bg-red-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full cursor-pointer" required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Service Description..." className="lg:col-span-4 bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 h-24 font-medium" required />
            <button className="lg:col-span-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-lg shadow-red-600/20">
              Publish New Service
            </button>
          </form>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s) => (
            <div key={s._id} className="group bg-zinc-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-red-600/30 transition-all duration-500">
              <div className="relative h-48">
                <img src={s.image?.startsWith('http') ? s.image : `${BASE_URL}/${s.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.title} />
                <button onClick={() => deleteService(s._id)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black uppercase italic text-white mb-2">{s.title}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-red-600 font-black italic text-lg">₹{s.price}</span>
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={12} /> {s.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;