import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Trash2, Package, Image as ImageIcon, IndianRupee, Sparkles, Box } from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const BASE_URL = "http://localhost:5000";

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addProduct = async (e) => {
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
    formData.append("image", image);

    try {
      await api.post("/products", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });
      setForm({ name: "", price: "", description: "" });
      setImage(null);
      setPreview(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error adding product. Please check login status.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed. Token might be expired.");
    }
  };

  return (
    <div className="p-8 bg-darkbg min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-red-600 animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Stock Control</p>
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Product <span className="text-red-600">Inventory</span>
          </h1>
          <div className="h-1 w-20 bg-red-600 mt-4"></div>
        </div>

        {/* ADD PRODUCT FORM */}
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 mb-12 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-600 p-2 rounded-xl"><Plus size={20} className="text-white"/></div>
            <h2 className="text-xl font-black uppercase italic tracking-tight text-zinc-200">New Inventory Entry</h2>
          </div>

          <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Product Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Ceramic Wax" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-red-600/50 outline-none transition-all font-bold" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-red-600/50 outline-none transition-all font-bold" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Image Upload</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-zinc-800 file:text-white hover:file:bg-red-600 cursor-pointer transition-all" required />
            </div>

            {/* PREVIEW BOX */}
            <div className="flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-zinc-950/50 h-[72px] mt-auto overflow-hidden">
                {preview ? <img src={preview} className="h-full w-full object-cover" /> : <ImageIcon className="text-zinc-800" />}
            </div>

            <div className="lg:col-span-4 space-y-2">
               <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">Specifications & Description</label>
               <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter product details..." className="w-full bg-zinc-950 border border-white/10 p-4 rounded-3xl focus:ring-2 focus:ring-red-600/50 outline-none h-24 font-medium" />
            </div>

            <button className="lg:col-span-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] text-xs py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
              Update Studio Stock
            </button>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-zinc-900/30 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest">Product</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-widest">Market Price</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center">
                            {p.image ? (
                            <img
                                src={p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image.startsWith('/') ? '' : '/'}${p.image}`}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
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
                    <button onClick={() => deleteProduct(p._id)} className="p-4 bg-zinc-950 text-zinc-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-xl group/btn">
                        <Trash2 size={20} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-24 text-center">
              <Box size={48} className="mx-auto text-zinc-800 mb-6" />
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">No Inventory Detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;