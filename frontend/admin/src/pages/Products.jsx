
import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Trash2, Edit3, X, Image as ImageIcon, IndianRupee, Sparkles, Box } from "lucide-react";

const getBaseUrl = () => {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isLocal ? "http://localhost:5000" : "https://g97.rerender";
};

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track editing state

  const BASE_URL = getBaseUrl();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // EDIT MODE START
  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || ""
    });
    // Set preview to existing image
    const existingImg = product.image?.startsWith('http') 
      ? product.image 
      : `${BASE_URL}${product.image?.startsWith('/') ? '' : '/'}${product.image}`;
    setPreview(existingImg);
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
    if (form.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (image) formData.append("image", image);

    // Store previous state for rollback
    const prevProducts = [...products];
    const tempId = editingId || `temp-${Date.now()}`;
    const tempProduct = { _id: tempId, name: form.name, price: form.price, description: form.description, image: preview };

    try {
      if (editingId) {
        // Optimistic update - update immediately
        setProducts(prev => prev.map(p => p._id === editingId ? { ...p, ...form, image: preview } : p));
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
      } else {
        // Optimistic add - show immediately
        setProducts(prev => [tempProduct, ...prev]);
        const res = await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        // Replace temp with real
        setProducts(prev => prev.map(p => p._id === tempId ? res.data.product : p));
      }
      cancelEdit();
    } catch (err) {
      console.error(err);
      setProducts(prevProducts); // Rollback on error
      alert("Operation failed. Check if you are logged in.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product from inventory?")) return;
    const prevProducts = [...products];
    // Optimistic delete - remove immediately
    setProducts(prev => prev.filter(p => p._id !== id));
    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
      setProducts(prevProducts); // Rollback on error
    }
  };

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-red-600 animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Stock Control</p>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Product <span className="text-red-600">{editingId ? "Update" : "Inventory"}</span>
          </h1>
        </div>

        {/* ADD / EDIT FORM */}
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 mb-12 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-600 p-2 rounded-xl">
               {editingId ? <Edit3 size={20} className="text-white"/> : <Plus size={20} className="text-white"/>}
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight text-zinc-200">
                {editingId ? "Modify Product Details" : "New Inventory Entry"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Product Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Ceramic Wax" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none font-bold" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl outline-none font-bold" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Image Upload</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white cursor-pointer" />
            </div>

            <div className="flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-zinc-950/50 h-[72px] mt-auto overflow-hidden">
                {preview ? <img src={preview} className="h-full w-full object-cover" /> : <ImageIcon className="text-zinc-800" />}
            </div>

            <div className="lg:col-span-4 space-y-2">
               <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Description</label>
               <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter product details..." className="w-full bg-zinc-950 border border-white/10 p-4 rounded-3xl outline-none h-24 font-medium" />
            </div>

            <div className="lg:col-span-4 flex gap-4">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] text-xs py-5 rounded-2xl transition-all shadow-lg">
                {editingId ? "Update Product" : "Update Studio Stock"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="bg-zinc-800 hover:bg-zinc-700 px-8 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Product</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest">Price</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-6">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center">
                            {p.image ? (
                              <img src={p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image.startsWith('/') ? '' : '/'}${p.image}`} className="w-full h-full object-cover" alt={p.name} />
                            ) : (
                              <Box className="text-zinc-800" size={24} />
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-white uppercase italic text-lg leading-none mb-2">{p.name}</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest line-clamp-1 max-w-xs">{p.description}</p>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="flex items-center gap-1 font-black text-red-600 italic text-xl">
                      <IndianRupee size={16} /> {p.price}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(p)} className="p-4 bg-zinc-950 text-zinc-400 hover:text-white rounded-2xl transition-all">
                            <Edit3 size={20} />
                        </button>
                        <button onClick={() => deleteProduct(p._id)} className="p-4 bg-zinc-950 text-zinc-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;