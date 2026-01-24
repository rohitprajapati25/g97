import { useEffect, useState } from "react";
import api from "../api/axios";
import { Plus, Trash2, Package, Image as ImageIcon, IndianRupee } from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // Image preview ke liye

  const BASE_URL = "http://localhost:5000";

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Image selection handle karna aur preview dikhana
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();

    // 🛑 VALIDATION: Price negative nahi honi chahiye
    if (form.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("image", image);

    try {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ name: "", price: "", description: "" });
      setImage(null);
      setPreview(null);
      fetchProducts();
    } catch (err) {
      alert("Error adding product");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">
            Inventory <span className="text-red-600">Management</span>
          </h1>
          <p className="text-slate-500 font-medium">Add and manage your premium car care products.</p>
        </div>

        {/* ADD PRODUCT FORM */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-50 text-red-600 p-2 rounded-lg"><Plus size={20}/></div>
            <h2 className="text-xl font-black uppercase italic text-slate-800">Add New Product</h2>
          </div>

          <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Product Name</label>
              <input
                placeholder="Ex: Ceramic Wax"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Price (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                required
              />
            </div>

            <div className="space-y-1 lg:col-span-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-red-50 file:text-red-600 hover:file:bg-red-100 cursor-pointer"
                required
              />
            </div>

            <div className="lg:col-span-4 space-y-1">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Description</label>
               <textarea
                placeholder="Product details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-slate-100 bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all h-24"
              />
            </div>

            <button className="lg:col-span-4 bg-slate-900 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
              <Package size={16}/> Push to Inventory
            </button>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Preview</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Product Info</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center">Price</th>
                <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
    {p.image ? (
      <img
        // Yahan dhyan de: Agar path me slash nahi hai toh manually add karein
        src={p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image.startsWith('/') ? '' : '/'}${p.image}`}
        alt={p.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150?text=No+Image"; // Agar path galat ho toh ye dikhega
        }}
      />
    ) : (
      <ImageIcon className="text-slate-300" size={24} />
    )}
  </div>
</td>
                  <td className="py-4 px-6">
                    <h3 className="font-black text-slate-900 uppercase italic">{p.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{p.description || "No description available"}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center font-black text-slate-900">
                      <IndianRupee size={14} /> {p.price}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
  <button
    onClick={() => deleteProduct(p._id)}
    className="group/btn p-3 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all duration-300 shadow-sm"
    title="Delete Product"
  >
    <Trash2 size={20} className="transition-transform group-hover/btn:scale-110" />
  </button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-20 text-center">
              <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No products in stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;