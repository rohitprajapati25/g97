import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { Plus, Trash2, Edit3, X, Clock, Sparkles } from "lucide-react";
import { AdminServiceCardSkeleton, ErrorState } from "../components/Skeleton";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", duration: "" });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/services", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data.services || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setImageFile(e.target.files[0]);

  const startEdit = (service) => {
    setEditingId(service._id);
    setForm({ title: service.title, description: service.description, price: service.price, duration: service.duration });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", description: "", price: "", duration: "" });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (imageFile) formData.append("image", imageFile);

    const prevServices = [...services];
    setSubmitting(true);

    try {
      if (editingId) {
        setServices(prev => prev.map(s => s._id === editingId ? { ...s, ...form } : s));
        await api.put(`/services/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        if (window.toast) window.toast('success', 'Updated', 'Service updated successfully');
      } else {
        const tempId = `temp-${Date.now()}`;
        const tempService = { _id: tempId, ...form, image: imageFile ? URL.createObjectURL(imageFile) : null };
        setServices(prev => [tempService, ...prev]);
        const res = await api.post("/services", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        setServices(prev => prev.map(s => s._id === tempId ? (res.data.service || res.data) : s));
        if (window.toast) window.toast('success', 'Published', 'New service added');
      }
      cancelEdit();
    } catch (err) {
      if (window.toast) window.toast('error', 'Error', err.response?.data?.message || 'Action failed');
      setServices(prevServices);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    const prevServices = [...services];
    setServices(prev => prev.filter(s => s._id !== id));
    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (window.toast) window.toast('success', 'Deleted', 'Service removed');
    } catch (err) {
      if (window.toast) window.toast('error', 'Error', err.response?.data?.message || 'Delete failed');
      setServices(prevServices);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-2 text-red-600">
            <Sparkles size={16} className="animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
              {editingId ? "Updating Service" : "Studio Management"}
            </p>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter">
            {editingId ? "Edit" : "Service"} <span className="text-red-600">{editingId ? "Details" : "Menu"}</span>
          </h1>
        </div>

        {/* FORM */}
        <div className="bg-zinc-900/40 p-6 sm:p-8 rounded-[2.5rem] border border-white/5 mb-8 sm:mb-12 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <input name="title" value={form.title} onChange={handleChange} placeholder="Service Title"
              className="bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 font-bold" required />
            <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g. 2 hrs)"
              className="bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 font-bold" required />
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price (₹)"
              className="bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600/50 font-bold" required />
            <input type="file" onChange={handleImageChange}
              className="text-[10px] text-zinc-500 file:bg-red-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full cursor-pointer" />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description..."
              className="lg:col-span-4 bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none h-24 font-medium" required />
            <div className="lg:col-span-4 flex gap-4">
              <button
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : editingId ? "Update Changes" : "Publish New Service"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-zinc-800 hover:bg-zinc-700 px-8 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ERROR STATE */}
        {error && !loading && <ErrorState message={error} onRetry={fetchServices} />}

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => <AdminServiceCardSkeleton key={i} />)
          ) : (
            services.map((s) => (
              <div key={s._id} className="group bg-zinc-900/50 rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-red-600/30 transition-all duration-500">
                <div className="relative h-48">
                  <img
                    src={s.image?.startsWith('http') ? s.image : `https://images.unsplash.com/photo-1558618047-3c8c76dfd330`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={s.title}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1558618047-3c8c76dfd330'; }}
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => startEdit(s)} className="p-3 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-xl transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => deleteService(s._id)} className="p-3 bg-black/60 backdrop-blur-md text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black uppercase italic text-white mb-2">{s.title}</h3>
                  <p className="text-zinc-500 text-xs line-clamp-2 mb-4">{s.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-red-600 font-black italic text-lg">₹{s.price}</span>
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      <Clock size={12} /> {s.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* EMPTY STATE */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <Sparkles size={40} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No services yet. Add your first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Services;
