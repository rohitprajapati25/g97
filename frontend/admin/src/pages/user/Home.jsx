
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../api/axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles, ChevronRight, Star, Shield, Zap, ShoppingBag,
  Clock, ArrowRight, CheckCircle2, Car, CalendarCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── Global GSAP defaults for consistent smoothness ───────────────────────────
gsap.defaults({ ease: "power3.out", overwrite: "auto" });

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  // One ref for the entire page — all animations scoped inside it
  const pageRef = useRef(null);

  useEffect(() => {
    api.get("/services")
      .then((r) => setServices((r.data.services || r.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // ALL GSAP — single context, single cleanup
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Wait one frame so the DOM is fully painted before measuring
    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        const page = pageRef.current;
        if (!page) return;

        // ── 1. HERO — timeline, plays on load ──────────────────────────────
        // Use gsap.set() to hide — never inline style={{ opacity:0 }}
        const badge   = page.querySelector(".anim-badge");
        const lines   = page.querySelectorAll(".anim-line");
        const subs    = page.querySelectorAll(".anim-sub");
        const stats   = page.querySelectorAll(".anim-stat");
        const heroImg = page.querySelector(".anim-hero-img");

        // Set initial hidden state via GSAP (not inline styles)
        gsap.set([badge, lines, subs, stats, heroImg], { opacity: 0 });
        gsap.set(lines,   { y: 50 });
        gsap.set(subs,    { y: 24 });
        gsap.set(stats,   { y: 16 });
        gsap.set(badge,   { y: -16, scale: 0.92 });
        gsap.set(heroImg, { x: 60, scale: 0.96 });

        const heroTl = gsap.timeline({
          delay: 0.1,
          defaults: { ease: "power3.out" },
        });

        heroTl
          // Badge drops in
          .to(badge, { opacity: 1, y: 0, scale: 1, duration: 0.55 })
          // H1 lines stagger up — no skew (causes layout jank)
          .to(lines, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, "-=0.25")
          // Paragraph + buttons
          .to(subs,  { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.35")
          // Stats
          .to(stats, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.3")
          // Image slides in — starts early, overlaps with text
          .to(heroImg, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "power2.out" }, 0.3);

        // ── 2. WHY US — scroll reveal ───────────────────────────────────────
        const whyHeading = page.querySelector(".anim-why-heading");
        const whyCards   = page.querySelectorAll(".anim-why-card");

        if (whyHeading) {
          gsap.set(whyHeading, { opacity: 0, y: 32 });
          gsap.to(whyHeading, {
            opacity: 1, y: 0, duration: 0.65,
            scrollTrigger: { trigger: whyHeading, start: "top 88%", once: true },
          });
        }

        if (whyCards.length) {
          gsap.set(whyCards, { opacity: 0, y: 44, scale: 0.97 });
          gsap.to(whyCards, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.65, stagger: 0.13,
            scrollTrigger: { trigger: whyCards[0], start: "top 85%", once: true },
          });
        }

        // ── 3. SERVICES — scroll reveal ─────────────────────────────────────
        const svcHeading = page.querySelector(".anim-svc-heading");
        const svcCards   = page.querySelectorAll(".anim-svc-card");

        if (svcHeading) {
          gsap.set(svcHeading, { opacity: 0, y: 28 });
          gsap.to(svcHeading, {
            opacity: 1, y: 0, duration: 0.6,
            scrollTrigger: { trigger: svcHeading, start: "top 88%", once: true },
          });
        }

        if (svcCards.length) {
          gsap.set(svcCards, { opacity: 0, y: 50 });
          gsap.to(svcCards, {
            opacity: 1, y: 0,
            duration: 0.6, stagger: 0.12,
            scrollTrigger: { trigger: svcCards[0], start: "top 85%", once: true },
          });
        }

        // ── 4. HOW IT WORKS — scroll reveal ────────────────────────────────
        const stepHeading = page.querySelector(".anim-step-heading");
        const stepCards   = page.querySelectorAll(".anim-step-card");
        const stepLines   = page.querySelectorAll(".anim-step-line");

        if (stepHeading) {
          gsap.set(stepHeading, { opacity: 0, y: 28 });
          gsap.to(stepHeading, {
            opacity: 1, y: 0, duration: 0.6,
            scrollTrigger: { trigger: stepHeading, start: "top 88%", once: true },
          });
        }

        if (stepCards.length) {
          gsap.set(stepCards, { opacity: 0, y: 36, scale: 0.95 });
          gsap.to(stepCards, {
            opacity: 1, y: 0, scale: 1,
            duration: 0.55, stagger: 0.14,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: stepCards[0], start: "top 85%", once: true },
          });
        }

        if (stepLines.length) {
          gsap.set(stepLines, { scaleX: 0, transformOrigin: "left center" });
          gsap.to(stepLines, {
            scaleX: 1, duration: 0.7, stagger: 0.14,
            ease: "power2.inOut",
            scrollTrigger: { trigger: stepCards[0], start: "top 85%", once: true },
          });
        }

        // ── 5. CTA BANNER ───────────────────────────────────────────────────
        const cta = page.querySelector(".anim-cta");
        if (cta) {
          gsap.set(cta, { opacity: 0, y: 40, scale: 0.98 });
          gsap.to(cta, {
            opacity: 1, y: 0, scale: 1, duration: 0.75,
            scrollTrigger: { trigger: cta, start: "top 88%", once: true },
          });
        }

      }, pageRef); // scope to pageRef

      return () => ctx.revert();
    });

    return () => cancelAnimationFrame(raf);
  }, [services]); // re-run when services load so their cards get animated

  return (
    <div ref={pageRef} className="min-h-screen bg-darkbg font-sans text-white overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        {/* bg glow */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 blur-[120px] opacity-20 pointer-events-none">
          <div className="aspect-square h-[600px] rounded-full bg-red-600" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* ── Left text ── */}
          <div className="text-left">
            {/* Badge — GSAP hides this via gsap.set, no inline opacity */}
            <div className="anim-badge inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
              <Sparkles size={14} className="animate-pulse" />
              Auto Hub Detailing Studio
            </div>

            {/* H1 — each line is a separate element for stagger */}
            <h1 className="text-4xl lg:text-6xl font-black italic leading-[0.9] mb-8 uppercase tracking-tighter text-white">
              <span className="anim-line block will-change-transform">The Ultimate</span>
              <span className="anim-line block will-change-transform text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                Studio
              </span>
              <span className="anim-line block will-change-transform">Experience</span>
            </h1>

            {/* Paragraph */}
            <p className="anim-sub text-zinc-400 text-lg md:text-xl max-w-lg mb-8 leading-relaxed font-medium will-change-transform">
              Auto Hub Detailing Studio offers India's most advanced Nano Ceramic coatings,
              Self-Healing PPF, and bespoke automotive restoration.
            </p>

            {/* Buttons */}
            <div className="anim-sub flex flex-col sm:flex-row gap-4 will-change-transform">
              <button
                onClick={() => navigate("/services")}
                className="group relative bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_15px_40px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3 active:scale-95"
              >
                Book Your Slot <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/store")}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs backdrop-blur-md transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Pro Shop <ShoppingBag size={18} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-10 border-t border-white/5">
              {[
                { val: "5000+", label: "Happy Cars"   },
                { val: "8+",    label: "Years Studio" },
                { val: "100%",  label: "Satisfaction" },
              ].map((b) => (
                <div key={b.label} className="anim-stat will-change-transform">
                  <p className="text-white font-black text-2xl italic">{b.val}</p>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right image ── */}
          <div className="anim-hero-img relative group will-change-transform">
            <div className="absolute -inset-4 bg-gradient-to-tr from-red-600/20 to-transparent rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-square">
              <img
                src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9"
                alt="Auto Hub Detailing Studio"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white font-black text-xs uppercase tracking-widest">Studio Open</p>
                </div>
                <p className="text-zinc-400 text-[10px] font-bold mt-0.5">Daily · 9:30AM–7PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="anim-why-heading text-center max-w-3xl mx-auto mb-16 will-change-transform">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 text-[10px] font-black tracking-[0.2em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
              Our Edge
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic tracking-tighter">
              Why <span className="text-red-600">Auto Hub</span>?
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
              Excellence in every micro-fiber stroke.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Master Detailers", desc: "Internationally certified ceramic and PPF installers with 8+ years of studio experience.", icon: <Star size={24} className="text-red-600" /> },
              { title: "Studio Standards", desc: "Proprietary formulas and laser-cut protection films precision-fitted for every car model.", icon: <Zap size={24} className="text-red-600" /> },
              { title: "Elite Trust",      desc: "5,000+ happy car owners trust Auto Hub for ceramic coating, PPF, and full detailing.",    icon: <Shield size={24} className="text-red-600" /> },
            ].map((f, i) => (
              <div key={i} className="anim-why-card group bg-zinc-900/30 p-10 rounded-[2.5rem] border border-white/5 hover:border-red-600/30 transition-all duration-500 will-change-transform">
                <div className="h-14 w-14 bg-zinc-950 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:border-red-600/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black mb-3 uppercase italic">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SERVICES PREVIEW
      ══════════════════════════════════════════════════════════════════ */}
      {services.length > 0 && (
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="anim-svc-heading flex items-end justify-between mb-12 will-change-transform">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 text-[10px] font-black tracking-[0.2em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
                  What We Offer
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                  Our <span className="text-red-600">Services</span>
                </h2>
              </div>
              <button
                onClick={() => navigate("/services")}
                className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div
                  key={s._id}
                  onClick={() => navigate("/services")}
                  className="anim-svc-card group bg-zinc-900/40 rounded-3xl border border-white/5 overflow-hidden hover:border-red-600/30 transition-all duration-500 cursor-pointer will-change-transform"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={s.image || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330"}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-white font-black text-sm">&#8377;{s.price}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-1">{s.title}</h3>
                    <p className="text-zinc-500 text-xs line-clamp-2 mb-4">{s.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <Clock size={11} className="text-red-500" /> {s.duration}
                      </div>
                      <div className="flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                        Book Now <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <button
                onClick={() => navigate("/services")}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                View All Services <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-zinc-900/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="anim-step-heading text-center mb-16 will-change-transform">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 text-[10px] font-black tracking-[0.2em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
              Simple Process
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
              How It <span className="text-red-600">Works</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: <Car size={22} />,           title: "Choose Service", desc: "Pick from our premium detailing packages." },
              { step: "02", icon: <CalendarCheck size={22} />,  title: "Book a Slot",    desc: "Select your date and time in seconds."    },
              { step: "03", icon: <CheckCircle2 size={22} />,   title: "Get Confirmed",  desc: "We confirm your appointment instantly."   },
              { step: "04", icon: <Sparkles size={22} />,       title: "Drive Pristine", desc: "Pick up your car looking brand new."      },
            ].map((s, i) => (
              <div key={i} className="relative">
                {/* Connector line between steps */}
                {i < 3 && (
                  <div className="anim-step-line hidden lg:block absolute top-8 left-full w-full h-px bg-white/15 z-0 origin-left" />
                )}
                <div className="anim-step-card relative z-10 bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:border-red-600/20 transition-all will-change-transform">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl border border-white/5 flex items-center justify-center text-red-600">
                      {s.icon}
                    </div>
                    <span className="text-zinc-800 font-black text-3xl italic">{s.step}</span>
                  </div>
                  <h3 className="text-white font-black text-base uppercase italic mb-2">{s.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="anim-cta relative bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] overflow-hidden p-10 lg:p-16 will-change-transform">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-red-200 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Limited Slots Daily</p>
                <h2 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tighter text-white leading-tight">
                  Ready to Transform<br />Your Car?
                </h2>
                <p className="text-red-200 text-sm mt-3 max-w-md">
                  Book your slot today. Premium detailing, ceramic coating, and PPF — all under one roof.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <button
                  onClick={() => navigate("/services")}
                  className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95"
                >
                  <Sparkles size={14} /> Book Now
                </button>
                <button
                  onClick={() => window.open("https://wa.me/916359274784", "_blank")}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                >
                  WhatsApp Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
