import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-32">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20">
          <div className="aspect-square h-[500px] rounded-full bg-red-600"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-left">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-red-500 uppercase bg-red-500/10 rounded-full">
              ✨ Premium Auto Care
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8">
              Your Car Deserves <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                The Best Shine
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
              Experience India's most trusted professional detailing, ceramic coating, 
              and premium car wash services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/services")}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-red-600/30 transition-all hover:-translate-y-1"
              >
                Book a Service
              </button>
              <button
                onClick={() => navigate("/store")}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-4 rounded-xl font-bold backdrop-blur-sm transition-all"
              >
                Visit Store
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <img
              src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9"
              alt="Car Care"
              className="relative rounded-2xl shadow-2xl grayscale-[20%] group-hover:grayscale-0 transition duration-500 object-cover w-full h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* --- WHY US SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why G97 Auto Care?</h2>
            <p className="text-gray-600">We combine advanced technology with expert craftsmanship to deliver unmatched results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Expert Pros", desc: "Certified detailers with 10+ years of experience.", icon: "🏆" },
              { title: "Premium Tech", desc: "Using only the world's best car care formulations.", icon: "🧪" },
              { title: "Trusted by 5k+", desc: "Top rated service with pan-India presence.", icon: "⭐" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTAs --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-12 text-white group">
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Professional Services</h3>
              <p className="text-gray-400 mb-8 max-w-sm">
                From ceramic coatings to deep interior cleaning, we treat your car like ours.
              </p>
              <button 
                onClick={() => navigate("/services")}
                className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                Schedule Now
              </button>
            </div>
            <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-9xl">🚿</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-3xl bg-red-600 p-12 text-white group">
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Car Care Store</h3>
              <p className="text-red-100 mb-8 max-w-sm">
                Shop our hand-picked collection of waxes, shampoos, and microfiber towels.
              </p>
              <button 
                onClick={() => navigate("/store")}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-colors"
              >
                Browse Shop
              </button>
            </div>
            <div className="absolute bottom-0 right-0 opacity-20 group-hover:opacity-40 transition-opacity">
               <span className="text-9xl">🛍️</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-bold text-xl tracking-tighter">G97 <span className="text-red-600">AUTO CARE</span></p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} G97 Auto Care. Made with ❤️ for Cars.
          </p>
          <div className="flex gap-6 text-gray-400">
             {/* Icons would go here */}
             <span className="hover:text-red-600 cursor-pointer">Instagram</span>
             <span className="hover:text-red-600 cursor-pointer">Facebook</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;