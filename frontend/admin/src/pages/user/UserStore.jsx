import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import Footer from "../../components/Footer";
import { ProductCardSkeleton, ErrorStateLight } from "../../components/Skeleton";
import { 
  ShoppingCart, Trash2, MessageCircle, Lock, 
  Plus, Minus, X, ShoppingBag, Zap, ArrowLeft
} from "lucide-react";

function UserStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // --- CONFIGURATION ---
  const WHATSAPP_NUMBER = "916359274784"; // Auto Hub Detailing Studio WhatsApp
  const token = localStorage.getItem("userToken");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- CART LOGIC ---
  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);
    if (exists) {
      setCart(cart.map((item) => 
        item._id === product._id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setShowCart(true);
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // --- CHECKOUT VIA WHATSAPP ---
  const handleCheckout = () => {
    if (!token) {
      alert("Please login to place your order!");
      navigate("/login");
      return;
    }

    if (cart.length === 0) return alert("Your cart is empty!");

    // Formatting Message
    let message = `*🔥 NEW ORDER: AUTO HUB DETAILING STUDIO*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *Customer:* ${userData.name || "User"}\n`;
    message += `📞 *Phone:* ${userData.phone || "Not Provided"}\n`;
    message += `📧 *Email:* ${userData.email || "N/A"}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    cart.forEach((item, index) => {
      message += `*${index + 1}. ${item.name.toUpperCase()}*\n`;
      message += `   Qty: ${item.qty} | Price: ₹${item.price * item.qty}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL PAYABLE: ₹${totalAmount}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Please confirm my order and send payment details.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative font-sans text-slate-900">
      <Navbar />

      {/* --- FLOATING CART ICON --- */}
      <button 
        onClick={() => setShowCart(true)}
        className="fixed bottom-8 right-8 z-50 bg-red-600 text-white p-5 rounded-full shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group"
      >
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {cart.length}
          </span>
        )}
      </button>

      {/* --- CART SIDEBAR --- */}
      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-500">
            
            <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Your <span className="text-red-600">Gear</span></h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Review your selection</p>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold italic">"Your cart is empty. Fuel it up!"</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="group flex gap-5 items-center bg-gray-50 p-4 rounded-[1.5rem] border border-transparent hover:border-red-600/10 transition-all">
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain p-2" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm uppercase italic tracking-tight mb-1">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center bg-white rounded-lg border border-gray-200">
                            <button onClick={() => updateQty(item._id, -1)} className="p-1 hover:text-red-600"><Minus size={14}/></button>
                            <span className="px-2 font-bold text-xs">{item.qty}</span>
                            <button onClick={() => updateQty(item._id, 1)} className="p-1 hover:text-red-600"><Plus size={14}/></button>
                         </div>
                         <p className="text-red-600 font-black text-sm italic">₹{item.price * item.qty}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-8 px-2">
                <span className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em]">Total Estimate</span>
                <span className="text-3xl font-black text-slate-900 italic">₹{totalAmount}</span>
              </div>
              
              {!token ? (
                <button 
                  onClick={() => navigate("/user/login")}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl"
                >
                  <Lock size={16} /> Login to Order
                </button>
              ) : (
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-600/20"
                >
                  <MessageCircle size={18} fill="currentColor" /> Send Order to WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-950 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-red-600/10 blur-[120px] rounded-full -mr-32 sm:-mr-48 -mt-32 sm:-mt-48" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Back nav */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-10 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6 text-red-600 font-black uppercase tracking-[0.4em] text-[10px]">
            <Zap size={14} fill="currentColor" />
            <span>Authorized Gear Shop</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
            Pro <span className="text-red-600">Car Care</span> Store
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
            Professional Grade Detailing Essentials Used By The Masters.
          </p>
          </div>{/* end text-center */}
        </div>
      </section>

      {/* --- PRODUCTS GRID --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <ErrorStateLight message={error} onRetry={() => { setLoading(true); setError(""); api.get("/products").then(r => { setProducts(r.data.products || r.data || []); setLoading(false); }).catch(e => { setError(e.response?.data?.message || "Failed to load products"); setLoading(false); }); }} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No products available right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map((p) => (
                <div key={p._id} className="group bg-white rounded-[2.5rem] p-5 border border-gray-100 hover:shadow-2xl transition-all duration-500 relative flex flex-col">
                  <div className="relative h-48 sm:h-60 bg-[#f9f9f9] rounded-[2rem] overflow-hidden mb-6 flex items-center justify-center">
                    <img 
                      src={p.image} 
                      className="h-full w-full object-contain p-4 sm:p-8 transition-transform duration-700 group-hover:scale-110" 
                      alt={p.name}
                    />
                  </div>
                  <div className="flex-1 flex flex-col px-2">
                    <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-xl mb-2 group-hover:text-red-600 transition-colors leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between mb-6">
                      <span className="text-2xl font-black text-slate-950 italic">₹{p.price}</span>
                      <div className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-tighter">
                         <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                         Ready to ship
                      </div>
                    </div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg active:scale-95"
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default UserStore;