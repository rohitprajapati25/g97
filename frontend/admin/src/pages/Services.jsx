import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Trash2, Wrench, Clock, IndianRupee, Image as ImageIcon } from "lucide-react";

function Services() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
  });
  const [imageFile, setImageFile] = useState(null);

  // 🔥 Backend URL configuration
  const BASE_URL = "http://localhost:5000";

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const addService = async (e) => {
    e.preventDefault();

    // 🛑 VALIDATION: Price negative nahi honi chahiye
    if (Number(form.price) <= 0) {
      alert("Price must be a positive number");
      return;
    }

    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", Number(form.price));
    formData.append("duration", form.duration);
    formData.append("image", imageFile);

    try {
      await api.post("/services", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ title: "", description: "", price: "", duration: "" });
      setImageFile(null);
      fetchServices();
    } catch (err) {
      alert("Error adding service");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">
            Service <span className="text-red-600">Menu</span>
          </h1>
          <p className="text-slate-500 font-medium">Configure your premium garage offerings.</p>
        </div>

        {/* ➕ ADD SERVICE FORM */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-50 text-red-600 p-2 rounded-lg"><Plus size={20}/></div>
            <h2 className="text-xl font-black uppercase italic text-slate-800 tracking-tight">Add New Service</h2>
          </div>

          <form onSubmit={addService} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Service Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Ceramic Coating" className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all font-bold text-slate-800" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Duration</label>
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 2-3 Hours" className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all font-bold text-slate-800" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Price (₹)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all font-bold text-slate-800" required />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Thumbnail</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-red-50 file:text-red-600 hover:file:bg-red-100 cursor-pointer" required />
            </div>

            <div className="lg:col-span-4 space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Service details..." className="w-full border border-slate-100 bg-slate-50 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/10 transition-all h-24 font-medium text-slate-600" required />
            </div>

            <button className="lg:col-span-4 bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-2xl transition-all shadow-xl shadow-slate-200">
              Publish Service
            </button>
          </form>
        </div>

        {/* 📋 SERVICES TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Image</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest">Service Details</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-center">Duration</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest text-center">Price</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                      <img 
                        src={s.image ? (s.image.startsWith('http') ? s.image : `${BASE_URL}${s.image.startsWith('/') ? '' : '/'}${s.image}`) : "https://via.placeholder.com/150"} 
                        alt={s.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error" }}
                      />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <h3 className="font-black text-slate-900 uppercase italic text-sm leading-none mb-1">{s.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pro Garage Service</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-600 uppercase italic">
                      <Clock size={12}/> {s.duration}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="font-black text-slate-900 italic">₹{s.price}</span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button onClick={() => deleteService(s._id)} className="p-3 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center ml-auto">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div className="p-20 text-center">
              <Wrench size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No services in catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Services;