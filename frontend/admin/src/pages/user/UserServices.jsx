import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import { Sparkles, Clock, Calendar, Car, X, CheckCircle2, AlertCircle } from "lucide-react";

const formatTime = (time24) => {
  const [h, m] = time24.split(':');
  const hour12 = parseInt(h) % 12 || 12;
  const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
  return `${hour12}:${m} ${ampm}`;
};

const getNextDates = () => {
  const dates = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const UserServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  const [bookingForm, setBookingForm] = useState({ 
    carType: "Sedan", 
    selectedDate: "", 
    selectedTime: ""
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get("/services").then(res => {
      setServices(res.data.services || res.data || []);
      setLoading(false);
    }).catch(() => {
      setServices([]);
      setLoading(false);
    });
  }, []);

  const fetchAvailableSlots = useCallback(async (serviceId, date) => {
    if (!serviceId || !date) {
      console.log('Missing serviceId or date:', serviceId, date);
      setAvailableSlots([]);
      return;
    }
    try {
      const res = await api.get(`/bookings/${serviceId}/slots?date=${date}`);
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      console.error('Slots fetch error:', err.response?.data || err);
      setAvailableSlots([]);
    }
  }, []);


  const openTicketModal = (service) => {
    if (!service || !service._id) {
      console.error('Service missing _id:', service);
      return;
    }
    if (!localStorage.getItem("userToken")) { 
      navigate("/user/login"); 
      return; 
    }
    setSelectedService(service);

    setBookingForm({ carType: "Sedan", selectedDate: "", selectedTime: "" });
    setAvailableSlots([]);
    setBookingStatus('idle');
    setErrorMsg('');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = 'auto';
  };

  const handleDateChange = (date) => {
    setBookingForm(prev => ({ ...prev, selectedDate: date, selectedTime: "" }));
    if (selectedService) fetchAvailableSlots(selectedService._id, date);
  };

  const handleTimeSelect = (slotStart) => {
    setBookingForm(prev => ({ ...prev, selectedTime: slotStart }));
    setErrorMsg('');
  };

  const submitBooking = async () => {
    const payload = {
      ...bookingForm,
      date: bookingForm.selectedDate,
      time: bookingForm.selectedTime,
      service: selectedService.title,
      phone: localStorage.getItem('userPhone') || '+91 9999999999' // Auto-fill
    };
    console.log('Booking payload:', payload);
    if (!payload.date || !payload.time || !payload.service || !payload.phone || !selectedService) {
      setErrorMsg('Missing required fields: date, time, service, phone');
      return;
    }
    if (!confirm(`Confirm booking "${selectedService.title}"?\nYour details will be auto-filled from registration.`)) {
      return;
    }
    setBookingStatus('loading');
    try {
      await api.post("/bookings", payload);
      // REFRESH slots after booking
      await fetchAvailableSlots(selectedService._id, bookingForm.selectedDate);
      setBookingStatus('success');
      setTimeout(closeModal, 2500);
    } catch (err) {
      setBookingStatus('error');
      setErrorMsg(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600/30">
      <Navbar /><br /><br />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] sm:text-xs font-black tracking-[0.2em] text-red-500 uppercase bg-red-500/10 border border-red-500/20 rounded-full">
            <Sparkles size={12} className="animate-pulse" /> Precision Detailing
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
            Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Service</span> Menu
          </h1>
          <p className="text-zinc-500 text-xs sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed px-4">
            Professional car care treatments at your fingertips. Secure your slot in seconds with our live studio calendar.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <div key={service._id} className="group bg-zinc-900/40 rounded-[2rem] border border-white/5 overflow-hidden hover:border-red-600/40 transition-all duration-500 shadow-xl flex flex-col">
              <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                <img src={service.image || 'https://images.unsplash.com/photo-1558618047-3c8c76dfd330'} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              </div>
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase italic tracking-tighter mb-2 sm:mb-3">{service.title}</h3>
                <p className="text-zinc-500 text-[11px] sm:text-xs lg:text-sm leading-relaxed mb-6 line-clamp-3">{service.description}</p>
                <div className="mt-auto flex justify-between items-center border-t border-white/5 pt-5 sm:pt-6">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black italic text-white">
                    <span className="text-red-600 mr-1">₹</span>{service.price}
                  </div>
                  <button 
                    onClick={() => openTicketModal(service)}
                    className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all active:scale-95"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TICKET BOOKING MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            
            <button onClick={closeModal} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-50 p-2 bg-zinc-800/50 rounded-full sm:bg-transparent">
              <X size={20} className="sm:w-8 sm:h-8" />
            </button>

            {/* Modal Content Header */}
            <div className="p-6 sm:p-10 lg:p-12 border-b border-white/5">
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white pr-10 leading-tight">
                {selectedService.title}
              </h2>
              <div className="flex items-center gap-3 mt-2 sm:mt-4">
                <p className="text-red-500 font-black uppercase tracking-[0.15em] text-[9px] sm:text-[11px]">Confirmation Request</p>
                <div className="h-1 w-1 rounded-full bg-zinc-700" />
                <p className="text-white font-black italic text-sm sm:text-lg">₹{selectedService.price}</p>
              </div>
            </div>


            <div className="p-6 sm:p-10 lg:p-12 space-y-10 sm:space-y-12">
              {/* Car Type Selector */}
              <div>
                <label className="flex items-center gap-2 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 sm:mb-6"><Car size={14}/> Vehicle Class</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Hatchback", "Sedan", "SUV", "Luxury"].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setBookingForm({...bookingForm, carType: type})}
                      className={`py-3 sm:py-4 rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] border transition-all ${
                        bookingForm.carType === type ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-zinc-950 border-white/10 text-zinc-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="flex items-center gap-2 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 sm:mb-6"><Calendar size={14}/> Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
                  {getNextDates().map((date) => {
                    const isSelected = date === bookingForm.selectedDate;
                    const d = new Date(date);
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateChange(date)}
                        className={`min-w-[75px] sm:min-w-[90px] h-[95px] sm:h-[110px] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center transition-all border snap-center ${
                        isSelected ? 'bg-red-600 border-red-600 text-white scale-105 shadow-xl' : 'bg-zinc-950 border-white/10 text-zinc-500 hover:border-red-600/30'
                      }`}
                      >
                        <span className="text-[8px] sm:text-[10px] font-black uppercase mb-1">{d.toLocaleDateString('en-US', {weekday: 'short'})}</span>
                        <span className="text-xl sm:text-2xl font-black">{d.getDate()}</span>
                        <span className="text-[8px] sm:text-[10px] font-bold opacity-60 uppercase">{d.toLocaleDateString('en-US', {month: 'short'})}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {bookingForm.selectedDate && availableSlots.length === 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <label className="flex items-center gap-2 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 sm:mb-6"><Clock size={14}/> Loading Slots...</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 bg-zinc-950/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5">
                    <div className="col-span-full text-center py-8 text-zinc-500">Slots loading...</div>
                  </div>
                </div>
              )}

              {bookingForm.selectedDate && availableSlots.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <label className="flex items-center gap-2 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 sm:mb-6"><Clock size={14}/> Available Slots</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 bg-zinc-950/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5">
                    {availableSlots.map((slot) => {
                      const isAvailable = slot.remaining_capacity > 0;
                      const isSelected = bookingForm.selectedTime === slot.slot_start;
                      return (
                        <button
                          key={`${slot.slot_start}-${slot.slot_end}`}
                          disabled={!isAvailable}
                          onClick={() => handleTimeSelect(slot.slot_start)}
                          className={`py-2.5 sm:py-3 rounded-xl font-bold text-xs transition-all border whitespace-nowrap text-center leading-tight ${
                            !isAvailable 
                              ? 'bg-zinc-900 border-transparent text-zinc-700 opacity-50 cursor-not-allowed' 
                              : isSelected 
                                ? 'bg-white border-white text-black shadow-lg scale-105 font-black ring-2 ring-red-400' 
                                : 'bg-zinc-900 border-white/20 text-zinc-400 hover:text-white hover:border-red-500 hover:bg-red-900/30'
                          }`}
                          title={`${slot.remaining_capacity}/${slot.total_capacity} spots`}
                        >
                          <div className="font-mono">{slot.slot_start}</div>
                          <div className="text-[10px] opacity-75">{slot.slot_end}</div>
                          <div className={`text-[10px] mt-1 ${isAvailable ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}`}>
                            {slot.remaining_capacity}/{slot.total_capacity}
                          </div>
                        </button>
                      );
                    })}
                    {availableSlots.length === 0 && (
                      <div className="col-span-full text-center py-12 text-zinc-500 text-sm">
                        No available slots for this date
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-6 sm:pt-8 pb-4 sm:pb-0">
                {bookingStatus === 'success' ? (
                  <div className="bg-green-500/10 border border-green-500/20 p-6 sm:p-8 rounded-2xl text-center animate-in fade-in">
                    <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter text-white mb-2">Booking Confirmed!</h3>
                    <p className="text-green-400 text-sm">Check your bookings page</p>
                  </div>
                ) : (
                  <>
                    {errorMsg && (
                      <div className="flex items-center gap-2 p-4 mb-6 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-400 text-sm font-bold uppercase animate-in slide-in-from-top-2">
                        <AlertCircle size={16} /> {errorMsg}
                      </div>
                    )}
                    <button
                      onClick={submitBooking}
                      disabled={bookingStatus === 'loading' || !bookingForm.selectedDate || !bookingForm.selectedTime || availableSlots.length === 0}
                      className="w-full py-5 sm:py-6 lg:py-7 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base sm:text-xl lg:text-2xl uppercase italic tracking-[0.2em] rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95"
                    >
                      {bookingStatus === 'loading' ? (
                        <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : `Secure Slot`}
                    </button>
                    <p className="text-center text-[10px] sm:text-xs text-zinc-600 font-bold uppercase tracking-widest mt-4 opacity-75">
                      Confirmation creates binding reservation
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserServices;
