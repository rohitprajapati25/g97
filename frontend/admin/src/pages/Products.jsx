import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { Plus, Trash2, Edit3, X, Image as ImageIcon, IndianRupee, Sparkles, Box } from "lucide-react";
import { AdminProductRowSkeleton, ErrorState } from "../components/Skeleton";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/products", { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({ name: product.name, price: product.price, description: product.description || "" });
    setPreview(product.image || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "" });
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.price) <= 0) {
      if (window.toast) window.toast('error', 'Invalid', 'Price must be greater than 0');
      else alert("Price must be greater than 0");
      return;
    }

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (image) formData.append("image", image);

    const prevProducts = [...products];
    setSubmitting(true);

    try {
      if (editingId) {
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...form, image: preview } : p));
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        if (window.toast) window.toast('success', 'Updated', 'Product updated successfully');
      } else {
        const tempId = `temp-${Date.now()}`;
        const tempProduct = { _id: tempId, name: form.name, price: form.price, description: form.description, image: preview };
        setProducts(prev => [tempProduct, ...prev]);
        const res = await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        setProducts(prev => prev.map(p => p._id === tempId ? (res.data.product || res.data) : p));
        if (window.toast) window.toast('success', 'Added', 'Product added to inventory');
      }
      cancelEdit();
    } catch (err) {
      if (window.toast) window.toast('error', 'Error', err.response?.data?.message || 'Operation failed');
      setProducts(prevProducts);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product from inventory?")) return;
    const prevProducts = [...products];
    setProducts(prev => prev.filter(p => p._id !== id));
    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (window.toast) window.toast('success', 'Deleted', 'Product removed from inventory');
    } catch (err) {
      if (window.toast) window.toast('error', 'Error', err.response?.data?.message || 'Delete failed');
      setProducts(prevProducts);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-red-600 animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Stock Control</p>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter">
            Product <span className="text-red-600">{editingId ? "Update" : "Inventory"}</span>
          </h1>
        </div>

        {/* FORM */}
        <div className="bg-zinc-900/40 p-6 sm:p-8 rounded-[2.5rem] border border-white/5 mb-8 sm:mb-12 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="bg-red-600 p-2 rounded-xl">
              {editingId ? <Edit3 size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight text-zinc-200">
              {editingId ? "Modify Product Details" : "New Inventory Entry"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Product Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Ceramic Wax" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none font-bold focus:border-red-600/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none font-bold focus:border-red-600/50" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Image Upload</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white cursor-pointer" />
            </div>
            <div className="flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-zinc-950/50 h-[72px] mt-auto overflow-hidden">
              {preview ? <img src={preview} className="h-full w-full object-cover" alt="preview" /> : <ImageIcon className="text-zinc-800" />}
            </div>
            <div className="lg:col-span-4 space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter product details..." className="w-full bg-zinc-950 border border-white/10 p-4 rounded-3xl outline-none h-24 font-medium focus:border-red-600/50" />
            </div>
            <div className="lg:col-span-4 flex gap-4">
              <button
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase tracking-[0.3em] text-xs py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : editingId ? "Update Product" : "Add to Inventory"}
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
        {error && !loading && <ErrorState message={error} onRetry={fetchProducts} />}

        {/* PRODUCTS TABLE */}
        <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400">
                <th className="py-6 px-6 sm:px-8 text-[10px] font-black uppercase tracking-widest">Product</th>
                <th className="py-6 px-4 sm:px-6 text-[10px] font-black uppercase tracking-widest">Price</th>
                <th className="py-6 px-6 sm:px-8 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => <AdminProductRowSkeleton key={i} />)
              ) : products.length === 0 && !error ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <Box size={40} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No products in inventory</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-6 sm:px-8">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center flex-shrink-0">
                          {p.image ? (
                            <img
                              src={p.image}
                              className="w-full h-full object-cover"
                              alt={p.name}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <Box className="text-zinc-800" size={24} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-white uppercase italic text-base sm:text-lg leading-none mb-1 sm:mb-2">{p.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest line-clamp-1 max-w-xs">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 sm:px-6">
                      <span className="flex items-center gap-1 font-black text-red-600 italic text-lg sm:text-xl">
                        <IndianRupee size={16} /> {p.price}
                      </span>
                    </td>
                    <td className="py-5 px-6 sm:px-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(p)} className="p-3 sm:p-4 bg-zinc-950 text-zinc-400 hover:text-white rounded-2xl transition-all">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => deleteProduct(p._id)} className="p-3 sm:p-4 bg-zinc-950 text-zinc-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
