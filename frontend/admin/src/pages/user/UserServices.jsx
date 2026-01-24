import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

function UserServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [booking, setBooking] = useState({
    userName: "",
    phone: "",
    carType: "Sedan",
    date: "",
    time: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/services");
        setServices(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const openBooking = (service) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/user/login");
      return;
    }
    setSelectedService(service);
    setShowModal(true);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bookings", {
        ...booking,
        service: selectedService.title,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(false);
        setBooking({
          userName: "",
          phone: "",
          carType: "Sedan",
          date: "",
          time: "",
        });
      }, 2000);
    } catch (err) {
      alert("Booking failed");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- PREMIUM HEADER --- */}
      <section className="bg-slate-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
            Our Expertise
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Car Care</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            From quick washes to advanced ceramic coatings, we provide 
            premium treatment for every vehicle that enters our studio.
          </p>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-20 bg-[#fbfbfb]">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-500 font-medium tracking-wide">Loading premium services...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s) => (
                <div
                  key={s._id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={s.image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f"}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4">
                       <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                         {s.duration || "Express"}
                       </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                      {s.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-400 block uppercase font-bold tracking-wider">Starts at</span>
                        <p className="text-2xl font-black text-slate-900">
                          ₹{s.price}
                        </p>
                      </div>

                      <button
                        onClick={() => openBooking(s)}
                        className="bg-slate-900 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-red-200"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- PREMIUM BOOKING MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[110] px-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-1 space-y-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {bookingSuccess ? (
              <div className="text-center py-16 px-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                  ✓
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2 italic uppercase">
                  Confirmed!
                </h3>
                <p className="text-gray-500">
                  Your car is scheduled for its makeover. We'll call you soon!
                </p>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                      Confirm <span className="text-red-600">Booking</span>
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Service: {selectedService?.title}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-red-600 transition-colors text-2xl">✕</button>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Full Name</label>
                      <input
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none"
                        value={booking.userName}
                        onChange={(e) => setBooking({ ...booking, userName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Phone</label>
                      <input
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none"
                        value={booking.phone}
                        onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Vehicle Category</label>
                    <select
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none appearance-none"
                      value={booking.carType}
                      onChange={(e) => setBooking({ ...booking, carType: e.target.value })}
                    >
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Hatchback</option>
                      <option>Luxury / Sports</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Preferred Date</label>
                      <input
                        type="date"
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none"
                        value={booking.date}
                        onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Preferred Time</label>
                      <input
                        type="time"
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all outline-none"
                        value={booking.time}
                        onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 hover:shadow-red-600/40 mt-6"
                  >
                    Confirm Appointment
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserServices;