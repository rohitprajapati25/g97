import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Sparkles, ChevronRight, Star, Shield, Zap, ShoppingBag } from "lucide-react";
import Footer from "../../components/Footer";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-darkbg font-sans text-white overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 blur-[120px] opacity-20">
          <div className="aspect-square h-[600px] rounded-full bg-red-600"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
              <Sparkles size={14} className="animate-pulse" />
              Auto Hub Detailing Studio
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black italic leading-[0.9] mb-8 uppercase tracking-tighter text-white">
              The Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                Studio
              </span> <br />
              Experience
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl max-w-lg mb-12 leading-relaxed font-medium">
              Auto Hub Detailing Studio offers India's most advanced Nano Ceramic coatings, 
              Self-Healing PPF, and bespoke automotive restoration.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <button onClick={() => navigate("/services")} className="group relative bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_15px_40px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3">
                Book Your Slot <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate("/store")} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs backdrop-blur-md transition-all flex items-center justify-center gap-3">
                Pro Shop <ShoppingBag size={18} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-red-600/20 to-transparent rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-square">
                <img src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9" alt="Auto Hub Detailing Studio" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY US SECTION --- */}
      <section className="py-32 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase italic tracking-tighter">Why <span className="text-red-600">Auto Hub</span>?</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Excellence in every micro-fiber stroke.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: "Master Detailers", desc: "Our team consists of internationally certified ceramic and PPF installers.", icon: <Star className="text-red-600" /> },
              { title: "Studio Standards", desc: "Proprietary formulas and laser-cut protection films for every car model.", icon: <Zap className="text-red-600" /> },
              { title: "Elite Trust", desc: "Join 5,000+ happy car owners who trust the Auto Hub Detailing Studio.", icon: <Shield className="text-red-600" /> },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-zinc-900/30 p-10 rounded-[3rem] border border-white/5 hover:border-red-600/30 transition-all duration-500">
                <div className="h-14 w-14 bg-zinc-950 rounded-2xl flex items-center justify-center mb-8 border border-white/5">{feature.icon}</div>
                <h3 className="text-2xl font-black mb-4 uppercase italic">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <Footer/>
    </div>
  );
}

export default Home;