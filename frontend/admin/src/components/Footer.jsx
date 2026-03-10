import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, ArrowUp, Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom"; // Agar aap React Router use kar rahe hain

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* BRAND IDENTITY */}
          <div className="space-y-6">
            <Link to="/" className="block group">
              <p className="font-black text-4xl tracking-tighter italic uppercase leading-none group-hover:text-red-500 transition-colors">
                AUTO <span className="text-red-600">HUB</span>
              </p>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
                Detailing Studio
              </p>
            </Link>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              India's premier automotive detailing studio. Specializing in Ceramic Coating, PPF, and High-End Paint Correction.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 text-zinc-500 hover:text-red-600 hover:border-red-600/40 transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* SERVICES MENU */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase italic tracking-widest text-[11px] flex items-center gap-2">
              <span className="w-4 h-px bg-red-600" /> Professional Services
            </h4>
            <ul className="grid grid-cols-1 gap-3">
              {['Ceramic Coating', 'Paint Protection Film', 'Exterior Detailing', 'Interior Deep Clean'].map((item) => (
                <li key={item}>
                  <Link to="/services" className="text-zinc-500 hover:text-white text-[13px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 group">
                    <ChevronRight size={14} className="text-red-600 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase italic tracking-widest text-[11px] flex items-center gap-2">
              <span className="w-4 h-px bg-red-600" /> Support & Booking
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/booking" className="inline-flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-5 py-3 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all duration-500 group w-full">
                  <Zap size={16} className="fill-current" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Book Slot Now</span>
                </Link>
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5">
                  <Phone size={14} className="text-red-600" />
                </div>
                <span className="text-xs font-bold">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/5">
                  <Mail size={14} className="text-red-600" />
                </div>
                <span className="text-xs font-bold">studio@autohub.com</span>
              </li>
            </ul>
          </div>

          {/* STUDIO HOURS */}
          <div className="space-y-6 p-6 bg-zinc-900/30 border border-white/5 rounded-[2rem] backdrop-blur-sm">
            <h4 className="text-white font-black uppercase italic tracking-widest text-[11px]">Studio Hours</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-zinc-500 text-[11px] font-bold uppercase">Mon - Sat</span>
                <span className="text-white text-[11px] font-black italic">09:00 - 20:00</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-zinc-500 text-[11px] font-bold uppercase">Sunday</span>
                <span className="text-red-600 text-[11px] font-black italic">CLOSED</span>
              </div>
              <p className="text-[10px] text-zinc-600 font-medium leading-tight mt-4 italic">
                *Booking is mandatory for weekend sessions.
              </p>
            </div>
          </div>
        </div>

        {/* COPYRIGHT AREA */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} AUTO HUB STUDIO.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-zinc-700 hover:text-zinc-400 text-[9px] font-black uppercase tracking-widest transition-colors">Privacy</Link>
              <Link to="/terms" className="text-zinc-700 hover:text-zinc-400 text-[9px] font-black uppercase tracking-widest transition-colors">Terms</Link>
            </div>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all duration-500"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Back to Top</span>
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 group-hover:border-red-600/50 group-hover:bg-red-600 transition-all">
              <ArrowUp size={16} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;