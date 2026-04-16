import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Mail, ArrowUpRight, Zap, MessageCircle,
  Instagram, Facebook, Youtube, Clock, ChevronRight,
} from "lucide-react";

// ─── Social links with real brand colours ─────────────────────────────────────
const SOCIALS = [
  {
    label: "Instagram",
    href:  "https://www.instagram.com/autohubdetailingstudio",
    icon:  <Instagram size={17} />,
    hover: "hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/5",
  },
  {
    label: "Facebook",
    href:  "https://www.facebook.com/autohubdetailingstudio",
    icon:  <Facebook size={17} />,
    hover: "hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5",
  },
  {
    label: "YouTube",
    href:  "https://www.youtube.com/@autohubdetailingstudio",
    icon:  <Youtube size={17} />,
    hover: "hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5",
  },
  {
    label: "WhatsApp",
    href:  "https://wa.me/916359274784",
    icon:  <MessageCircle size={17} />,
    hover: "hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5",
  },
];

const Footer = () => {
  const year     = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="bg-[#060606] border-t border-white/5 relative overflow-hidden">

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-red-600/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">

        {/* ══════════════════════════════════════════════════════════════
            MAIN GRID  —  Brand(4) | Services(2) | Links(2) | Contact(4)
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 py-14 lg:py-20">

          {/* ── Brand ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo text */}
            <div>
              <p className="font-black text-4xl sm:text-5xl tracking-tighter italic uppercase leading-none text-white">
                AUTO HUB<br /><span className="text-red-600">DETAILING</span>
              </p>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.35em] mt-2">
                Studio · Mogri, Anand, Gujarat
              </p>
            </div>

            {/* Tagline */}
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Gujarat's trusted ceramic coating &amp; PPF studio. Every car leaves looking showroom-fresh.
            </p>

            {/* Book CTA */}
            <button
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-600/20"
            >
              <Zap size={13} fill="currentColor" /> Book a Slot
            </button>

            {/* Social icons */}
            <div>
              <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-3">Follow Us</p>
              <div className="flex gap-2.5">
                {SOCIALS.map(({ label, href, icon, hover }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                    aria-label={label}
                    className={`w-9 h-9 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/5 text-zinc-500 transition-all duration-200 ${hover}`}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Services ── */}
          <div className="lg:col-span-2 space-y-5">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Services</p>
            <ul className="space-y-3">
              {[
                "Ceramic Coating",
                "Paint Protection Film",
                "Nano Coating",
                "Paint Correction",
              ].map((s) => (
                <li key={s}>
                  <Link
                    to="/services"
                    className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight size={10} className="text-red-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick Links ── */}
          <div className="lg:col-span-2 space-y-5">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Quick Links</p>
            <ul className="space-y-3">
              {[
                { label: "Book Now",    to: "/services"      },
                { label: "Our Store",   to: "/store"         },
                { label: "My Bookings", to: "/user/bookings" },
               
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight size={10} className="text-red-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact & Hours ── */}
          <div className="lg:col-span-4 space-y-6">
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Contact &amp; Hours</p>

            {/* Contact rows */}
            <div className="space-y-3">
              <a
                href="tel:+916359274784"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-red-600/30 transition-colors">
                  <Phone size={13} className="text-red-600" />
                </div>
                <span className="text-zinc-400 text-xs font-bold group-hover:text-white transition-colors">+91 63592 74784</span>
              </a>

              <a
                href="mailto:studio@autohub.in"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-red-600/30 transition-colors">
                  <Mail size={13} className="text-red-600" />
                </div>
                <span className="text-zinc-400 text-xs font-bold group-hover:text-white transition-colors">studio@autohub.in</span>
              </a>

              <a
                href="https://maps.google.com/?q=7PB+Estate+Mogri+Gana+Road+Mogri+Anand+Gujarat+388001"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-red-600/30 transition-colors">
                  <MapPin size={13} className="text-red-600" />
                </div>
                <span className="text-zinc-400 text-xs font-bold leading-relaxed group-hover:text-white transition-colors">
                  7PB Estate, Mogri - Gana Road,<br />
                  near Amin Auto Chokdi,<br />
                  Mogri, Anand, Gujarat 388001
                </span>
              </a>
            </div>

            {/* Hours card */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={12} className="text-red-600" />
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Studio Hours</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-[11px] font-bold uppercase">Mon – Sun</span>
                <span className="text-white text-[11px] font-black">09:30 AM – 07:00 PM</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Open Every Day</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/916359274784"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 hover:border-emerald-600/40 rounded-2xl px-4 py-3 transition-all group"
            >
              <MessageCircle size={18} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Chat on WhatsApp</p>
                <p className="text-zinc-500 text-[10px] font-bold mt-0.5">+91 63592 74784 · Open Daily</p>
              </div>
              <ArrowUpRight size={14} className="text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MAP
        ══════════════════════════════════════════════════════════════ */}
        <div className="pb-12 lg:pb-16">
          <div className="flex items-center gap-2.5 mb-5">
            <MapPin size={13} className="text-red-600" />
            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Find Us</p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-white/10 group">

            {/* Studio info overlay — top-left */}
            <div className="absolute top-4 left-4 z-10 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 pointer-events-none max-w-[200px] sm:max-w-none">
              <p className="text-white font-black text-xs uppercase tracking-widest leading-none">Auto Hub Detailing Studio</p>
              <p className="text-zinc-400 text-[10px] font-bold mt-1">Mogri, Anand, Gujarat 388001</p>
            </div>

            {/* Open in Maps — bottom-right */}
            <a
              href="https://maps.google.com/?q=7PB+Estate+Mogri+Gana+Road+Mogri+Anand+Gujarat+388001"
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
            >
              <MapPin size={11} /> Open in Maps
            </a>

            {/* Google Maps iframe */}
            <iframe
              title="Auto Hub Detailing Studio Location"
              src="https://maps.google.com/maps?q=7PB+Estate+Mogri+Gana+Road+near+Amin+Auto+Chokdi+Mogri+Anand+Gujarat+388001&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[260px] sm:h-[320px] lg:h-[380px] grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BOTTOM BAR
        ══════════════════════════════════════════════════════════════ */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.3em] text-center sm:text-left">
            © {year} Auto Hub Detailing Studio · All rights reserved.
          </p>

          {/* Mini social row in bottom bar */}
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={label}
                aria-label={label}
                className="text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors group"
          >
            Back to top
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/5 group-hover:border-red-600/40 group-hover:bg-red-600 flex items-center justify-center transition-all">
              <ArrowUpRight size={12} />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
