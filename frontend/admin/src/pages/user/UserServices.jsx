
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import {
  Sparkles, Clock, Calendar, Car, X, CheckCircle2,
  AlertCircle, ChevronRight, ArrowLeft, Shield, Timer, Zap,
} from "lucide-react";
import { ServiceCardSkeleton, ErrorState } from "../../components/Skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  const h12 = hr % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// toISO uses local date parts — avoids UTC offset shifting the date
const toISO = (d) => {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${dy}`;
};

const getNextDates = (n = 30) => {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
};

const DEFAULT_CAR_TYPES = [
  { id: "Hatchback", icon: "🚗", desc: "Small & compact" },
  { id: "Sedan",     icon: "🚙", desc: "Standard saloon"  },
  { id: "SUV",       icon: "🚕", desc: "Sport utility"    },
  { id: "Luxury",    icon: "🏎️", desc: "Premium class"    },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEP_LABELS = ["Vehicle", "Date", "Time", "Confirm"];

const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-6">
    {STEP_LABELS.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                done   ? "bg-emerald-500 text-white" :
                active ? "bg-red-600 text-white ring-4 ring-red-600/20" :
                         "bg-zinc-800 text-zinc-600"
              }`}
            >
              {done ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${
                active ? "text-red-500" : done ? "text-emerald-500" : "text-zinc-700"
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={`w-10 sm:w-16 h-px mx-1 mb-5 transition-all duration-500 ${
                done ? "bg-emerald-500" : "bg-zinc-800"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onBook }) => (
  <div className="group bg-zinc-900/60 rounded-3xl border border-white/5 overflow-hidden hover:border-red-600/40 transition-all duration-500 shadow-xl flex flex-col">
    <div className="relative h-52 overflow-hidden">
      <img
        src={service.image || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330"}
        alt={service.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
        <span className="text-white font-black text-sm">&#8377;{service.price}</span>
      </div>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 text-white">
        {service.title}
      </h3>
      <p className="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-2">
        {service.description}
      </p>
      <div className="flex items-center gap-4 mb-5 mt-auto">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Timer size={13} className="text-red-500" />
          <span className="text-xs font-bold">{service.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Zap size={13} className="text-amber-500" />
          <span className="text-xs font-bold">Instant Confirm</span>
        </div>
      </div>
      <button
        onClick={() => onBook(service)}
        className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg shadow-red-600/20"
      >
        Book Now
      </button>
    </div>
  </div>
);

// ─── Row helper (used in confirm + success) ───────────────────────────────────
const Row = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">{label}</span>
    <span className={`text-white text-sm font-bold ${mono ? "font-mono text-xs text-zinc-400" : ""}`}>
      {value}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UserServices = () => {
  const navigate = useNavigate();

  // Services list
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  // Modal / wizard state
  const [selectedService, setSelectedService] = useState(null);
  const [step,            setStep]            = useState(0); // 0=vehicle 1=date 2=time 3=confirm

  // Booking form values
  const [carType,       setCarType]       = useState("Sedan");
  const [customCarType, setCustomCarType] = useState("");   // user-typed custom vehicle
  const [isCustomCar,   setIsCustomCar]   = useState(false);
  const [selectedDate,  setSelectedDate]  = useState(null);   // Date object
  const [selectedTime,  setSelectedTime]  = useState("");     // "HH:MM"

  // Slots
  const [slots,        setSlots]        = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Submission
  const [submitting,  setSubmitting]  = useState(false);
  const [bookingDone, setBookingDone] = useState(null);  // booking result object
  const [errMsg,      setErrMsg]      = useState("");

  // ── Load services ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/services")
      .then((r) => { setServices(r.data.services || r.data || []); setLoading(false); })
      .catch((e) => { setError(e.response?.data?.message || "Failed to load services"); setLoading(false); });
  }, []);

  // ── Fetch available slots ──────────────────────────────────────────────────
  const fetchSlots = useCallback(async (serviceId, date) => {
    if (!serviceId || !date) return;
    setSlotsLoading(true);
    setSlots([]);
    try {
      const r = await api.get(`/bookings/${serviceId}/slots?date=${date}`);
      setSlots(r.data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // ── Open / close modal ─────────────────────────────────────────────────────
  const openModal = (service) => {
    if (!localStorage.getItem("userToken")) { navigate("/user/login"); return; }
    setSelectedService(service);
    setStep(0);
    setCarType("Sedan");
    setCustomCarType("");
    setIsCustomCar(false);
    setSelectedDate(null);
    setSelectedTime("");
    setSlots([]);
    setBookingDone(null);
    setErrMsg("");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = "auto";
  };

  // ── Step helpers ───────────────────────────────────────────────────────────
  const goNext = () => {
    // Step 0 validation — if custom, ensure something is typed
    if (step === 0 && isCustomCar) {
      const trimmed = customCarType.trim();
      if (!trimmed) { setErrMsg("Please enter your vehicle type."); return; }
      setCarType(trimmed);
      setErrMsg("");
    }
    setStep((s) => s + 1);
  };
  const goBack = () => { setStep((s) => s - 1); setErrMsg(""); };

  const handleDatePick = (d) => {
    setSelectedDate(d);
    setSelectedTime("");
    fetchSlots(selectedService._id, toISO(d));
    goNext();
  };

  const handleTimePick = (slot) => {
    setSelectedTime(slot.slot_start);
    goNext();
  };

  // ── Submit booking ─────────────────────────────────────────────────────────
  const submitBooking = async () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const phone    = localStorage.getItem("userPhone") || userData.phone || "";
    if (!phone) { setErrMsg("Phone number not found. Please log out and log in again."); return; }

    // Final carType — either preset or custom (already set in goNext)
    const finalCarType = isCustomCar ? customCarType.trim() : carType;
    if (!finalCarType) { setErrMsg("Please select or enter your vehicle type."); return; }

    setSubmitting(true);
    setErrMsg("");
    try {
      const res = await api.post("/bookings", {
        date:    toISO(selectedDate),
        time:    selectedTime,
        service: selectedService.title,
        carType: finalCarType,
        phone,
      });
      setBookingDone(res.data);
    } catch (e) {
      setErrMsg(e.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Retry services load ────────────────────────────────────────────────────
  const retryLoad = () => {
    setLoading(true);
    setError("");
    api.get("/services")
      .then((r) => { setServices(r.data.services || r.data || []); setLoading(false); })
      .catch((e) => { setError(e.response?.data?.message || "Failed"); setLoading(false); });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 lg:pb-20">

        {/* ── Back nav ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors mb-10 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── Page Header ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
            <Sparkles size={12} className="animate-pulse" /> Precision Detailing
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
            Elite{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Service
            </span>{" "}
            Menu
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Professional car care at your fingertips. Secure your slot in seconds.
          </p>
        </div>

        {/* ── Services Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={retryLoad} />
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">
              No services available right now
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((s) => (
              <ServiceCard key={s._id} service={s} onBook={openModal} />
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BOOKING MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedService && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-zinc-950 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 px-6 sm:px-8 pt-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <p className="text-red-500 text-[9px] font-black uppercase tracking-[0.25em] mb-1">
                    Book Service
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    {selectedService.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-zinc-400 font-black text-sm">
                      &#8377;{selectedService.price}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-zinc-500 text-xs font-bold flex items-center gap-1">
                      <Timer size={11} /> {selectedService.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors flex-shrink-0"
                >
                  <X size={18} className="text-zinc-400" />
                </button>
              </div>
              {!bookingDone && <Steps current={step} />}
            </div>

            {/* ── Modal Body ── */}
            <div className="px-6 sm:px-8 py-6 sm:py-8">

              {/* ── SUCCESS STATE ── */}
              {bookingDone && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">
                    Booking Confirmed!
                  </h3>
                  <p className="text-zinc-400 text-sm mb-8">
                    Your slot has been reserved. See you at the studio!
                  </p>

                  {/* Summary */}
                  <div className="bg-zinc-900 rounded-2xl border border-white/5 p-5 text-left space-y-2 mb-8">
                    <Row label="Service"  value={bookingDone.service} />
                    <Row label="Vehicle"  value={bookingDone.carType} />
                    <Row label="Date"     value={bookingDone.date} />
                    <Row label="Time"     value={fmt12(bookingDone.time)} />
                    <div className="border-t border-white/5 pt-3">
                      <Row label="Ref ID" value={bookingDone._id?.slice(-8).toUpperCase()} mono />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => navigate("/user/bookings")}
                      className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                    >
                      My Bookings
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 0 — Vehicle Type ── */}
              {!bookingDone && step === 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2">
                    <Car size={15} className="text-red-500" /> Select Your Vehicle Type
                  </h3>

                  {/* Preset options */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {DEFAULT_CAR_TYPES.map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => { setCarType(ct.id); setIsCustomCar(false); setCustomCarType(""); setErrMsg(""); }}
                        className={`p-5 rounded-2xl border text-left transition-all duration-200 ${
                          !isCustomCar && carType === ct.id
                            ? "bg-red-600/10 border-red-600 ring-1 ring-red-600/30"
                            : "bg-zinc-900 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="text-3xl mb-2">{ct.icon}</div>
                        <div className="font-black text-sm text-white uppercase tracking-wide">{ct.id}</div>
                        <div className="text-zinc-500 text-[10px] font-bold mt-0.5">{ct.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom vehicle option */}
                  <div
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isCustomCar
                        ? "border-red-600 bg-red-600/5"
                        : "border-white/5 bg-zinc-900 hover:border-white/20"
                    }`}
                  >
                    <button
                      onClick={() => { setIsCustomCar(true); setErrMsg(""); }}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div className="text-2xl">🚘</div>
                      <div>
                        <div className={`font-black text-sm uppercase tracking-wide ${isCustomCar ? "text-red-400" : "text-zinc-400"}`}>
                          Other / Custom
                        </div>
                        <div className="text-zinc-600 text-[10px] font-bold mt-0.5">
                          My vehicle isn't listed above
                        </div>
                      </div>
                      {isCustomCar && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}
                    </button>

                    {/* Custom input — slides open */}
                    {isCustomCar && (
                      <div className="px-4 pb-4">
                        <input
                          type="text"
                          value={customCarType}
                          onChange={(e) => { setCustomCarType(e.target.value); setErrMsg(""); }}
                          placeholder="e.g. Pickup Truck, Van, Convertible…"
                          maxLength={50}
                          autoFocus
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:border-red-500/60 focus:outline-none transition-colors"
                        />
                        <p className="text-zinc-600 text-[10px] font-bold mt-2">
                          {customCarType.length}/50 characters
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Validation error */}
                  {errMsg && (
                    <div className="flex items-center gap-2 p-3 mt-3 bg-red-600/10 border border-red-600/20 rounded-xl text-red-400 text-xs font-bold">
                      <AlertCircle size={14} className="flex-shrink-0" /> {errMsg}
                    </div>
                  )}

                  <button
                    onClick={goNext}
                    className="w-full py-4 mt-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* ── STEP 1 — Date Picker ── */}
              {!bookingDone && step === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <button
                      onClick={goBack}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <ArrowLeft size={16} className="text-zinc-400" />
                    </button>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Calendar size={15} className="text-red-500" /> Pick a Date
                    </h3>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {getNextDates(30).map((d) => {
                      const iso     = toISO(d);
                      const isToday = iso === toISO(new Date());
                      const isSel   = selectedDate && toISO(selectedDate) === iso;
                      return (
                        <button
                          key={iso}
                          onClick={() => handleDatePick(d)}
                          className={`flex flex-col items-center py-3 px-1 rounded-2xl border transition-all duration-200 hover:border-red-600/50 hover:bg-red-600/5 ${
                            isSel
                              ? "bg-red-600 border-red-600 text-white"
                              : "bg-zinc-900 border-white/5 text-zinc-400"
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                            {DAYS[d.getDay()]}
                          </span>
                          <span className="text-lg font-black my-0.5">{d.getDate()}</span>
                          <span className="text-[9px] font-bold opacity-60">
                            {MONTHS[d.getMonth()]}
                          </span>
                          {isToday && (
                            <span className="text-[8px] font-black text-red-400 mt-0.5">Today</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── STEP 2 — Time Slot Picker ── */}
              {!bookingDone && step === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <button
                      onClick={goBack}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <ArrowLeft size={16} className="text-zinc-400" />
                    </button>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <Clock size={15} className="text-red-500" /> Choose a Time Slot
                      </h3>
                      {selectedDate && (
                        <p className="text-zinc-600 text-[10px] font-bold mt-0.5">
                          {DAYS[selectedDate.getDay()]}, {selectedDate.getDate()}{" "}
                          {MONTHS[selectedDate.getMonth()]}
                        </p>
                      )}
                    </div>
                  </div>

                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        Loading slots...
                      </p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-16">
                      <Clock size={36} className="mx-auto text-zinc-700 mb-4" />
                      <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">
                        No slots available
                      </p>
                      <p className="text-zinc-600 text-xs mt-2">Try a different date</p>
                      <button
                        onClick={goBack}
                        className="mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                      >
                        Change Date
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {slots.map((slot) => {
                        const avail = slot.remaining_capacity > 0;
                        const isSel = selectedTime === slot.slot_start;
                        return (
                          <button
                            key={slot.slot_start}
                            disabled={!avail}
                            onClick={() => handleTimePick(slot)}
                            className={`flex flex-col items-center py-3.5 px-2 rounded-2xl border transition-all duration-200 ${
                              !avail
                                ? "bg-zinc-900/50 border-transparent text-zinc-700 cursor-not-allowed opacity-40"
                                : isSel
                                  ? "bg-white border-white text-black ring-2 ring-red-500/40"
                                  : "bg-zinc-900 border-white/10 text-zinc-300 hover:border-red-500/50 hover:bg-red-600/5"
                            }`}
                          >
                            <span className="font-black text-sm font-mono">
                              {fmt12(slot.slot_start)}
                            </span>
                            <span className="text-[9px] font-bold opacity-60 mt-0.5">
                              {fmt12(slot.slot_end)}
                            </span>
                            <span
                              className={`text-[9px] font-black mt-1.5 ${
                                avail ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {avail ? `${slot.remaining_capacity} left` : "Full"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3 — Review & Confirm ── */}
              {!bookingDone && step === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={goBack}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
                    >
                      <ArrowLeft size={16} className="text-zinc-400" />
                    </button>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <Shield size={15} className="text-red-500" /> Review &amp; Confirm
                    </h3>
                  </div>

                  {/* Booking summary card */}
                  <div className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden mb-6">
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={selectedService.image || "https://images.unsplash.com/photo-1558618047-3c8c76dfd330"}
                        alt={selectedService.title}
                        className="w-full h-full object-cover opacity-50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                      <div className="absolute bottom-3 left-5">
                        <h4 className="text-white font-black italic uppercase tracking-tighter text-lg">
                          {selectedService.title}
                        </h4>
                      </div>
                    </div>
                    <div className="p-5 space-y-2.5">
                      <Row
                        label="Vehicle"
                        value={`${DEFAULT_CAR_TYPES.find((c) => c.id === carType)?.icon ?? "🚘"} ${carType}`}
                      />
                      <Row
                        label="Date"
                        value={
                          selectedDate
                            ? `${DAYS[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`
                            : ""
                        }
                      />
                      <Row label="Time"     value={fmt12(selectedTime)} />
                      <Row label="Duration" value={selectedService.duration} />
                      <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                        <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                          Total
                        </span>
                        <span className="text-white font-black text-xl">
                          &#8377;{selectedService.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Error message */}
                  {errMsg && (
                    <div className="flex items-center gap-2 p-4 mb-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-400 text-sm font-bold">
                      <AlertCircle size={16} className="flex-shrink-0" /> {errMsg}
                    </div>
                  )}

                  {/* Confirm button */}
                  <button
                    onClick={submitBooking}
                    disabled={submitting}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base uppercase italic tracking-[0.15em] rounded-2xl shadow-2xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Shield size={18} /> Confirm Booking</>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-3">
                    No payment required now &nbsp;·&nbsp; Pay at studio
                  </p>
                </div>
              )}

            </div>{/* end modal body */}
          </div>{/* end panel */}
        </div>
      )}{/* end modal */}

    </div>
  );
};

export default UserServices;
