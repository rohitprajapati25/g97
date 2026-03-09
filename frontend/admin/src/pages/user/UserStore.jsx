import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

function UserStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        // API returns { total, page, limit, products }
        setProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- PREMIUM STORE HEADER --- */}
      <section className="bg-slate-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
            G97 Gear
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Pro <span className="text-red-600">Car Care</span> Store
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg italic">
            "Professional results, delivered to your doorstep."
          </p>
        </div>
      </section>

      {/* --- PRODUCTS GRID --- */}
      <section className="py-20 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-400 font-medium">Stocking the shelves...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
               <p className="text-gray-400 text-xl">New arrivals coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((p) => (
                <div
                  key={p._id}
                  className={`group bg-white rounded-[2rem] overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col ${
                    p.stock <= 0 ? "opacity-75 grayscale-[0.5]" : ""
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-64 bg-gray-50 overflow-hidden">
                    <img
                      src={p.image || "https://images.unsplash.com/photo-1552656791-61040445ec6c"}
                      alt={p.name}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Tags */}
                    {p.stock <= 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase">
                          Sold Out
                        </span>
                      </div>
                    )}
                    {p.stock > 0 && p.stock < 5 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase">
                          Low Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate">
                      {p.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed h-8">
                      {p.description}
                    </p>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <p className="text-2xl font-black text-slate-900">
                        ₹{p.price}
                      </p>
                      {p.stock > 0 && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {p.stock} Units Left
                        </span>
                      )}
                    </div>

                    <button
                      disabled={p.stock <= 0}
                      className={`w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 ${
                        p.stock > 0
                          ? "bg-slate-900 hover:bg-red-600 text-white shadow-lg shadow-slate-200 hover:shadow-red-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- TRUST FEATURES --- */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-red-600 group-hover:rotate-12 transition-all duration-300">
                🏆
              </div>
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">
                Premium Quality
              </h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                We only sell what we use in our own detailing studio. Quality guaranteed.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-red-600 group-hover:rotate-12 transition-all duration-300">
                🚚
              </div>
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">
                Express Shipping
              </h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Get your car care essentials delivered safely within 2-4 business days.
              </p>
            </div>

            <div className="group text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-red-600 group-hover:rotate-12 transition-all duration-300">
                🛡️
              </div>
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">
                100% Secure
              </h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Trusted by 5000+ car enthusiasts. Genuine products from authorized brands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MODERN FOOTER --- */}
      <footer className="bg-slate-900 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <span className="text-white font-black italic">G97</span>
             <span className="text-red-600 font-bold uppercase tracking-widest text-xs">Auto Care</span>
          </div>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">
            © {new Date().getFullYear()} G97 Auto Care • Perfection in every detail
          </p>
        </div>
      </footer>
    </div>
  );
}

export default UserStore;