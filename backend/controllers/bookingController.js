const Booking = require("../models/Booking");
const User = require("../models/User");
const Service = require("../models/Service");
const { generateAvailableSlots } = require('../utils/slots');

// Define ALL functions first as local consts (hoisted)

const parseDuration = (durationStr) => {
  const match = durationStr.match(/(\\d+)\\s*(hrs?|hours?|min|minutes?)/i);
  if (!match) return 60;
  const [, num, unit] = match;
  return parseInt(num) * (unit.toLowerCase().includes('hr') ? 60 : 1);
};

const parseTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const addMinutes = (minutes, add) => minutes + add;

const formatTime = (totalMin) => {
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
  const m = (totalMin % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const getAvailableSlots = async (req, res) => {
  try {
    const { service_id } = req.params;
    const { date } = req.query;
    if (!service_id || !date) {
      return res.status(400).json({ slots: [] });
    }
    const service = await Service.findById(service_id).lean();
    if (!service) {
      return res.status(404).json({ slots: [] });
    }
    const slots = await generateAvailableSlots(service, date);
    res.json({ slots });
  } catch (error) {
    console.error('getAvailableSlots error:', error);
    res.status(500).json({ slots: [] });
  }
};

const checkSlot = async (req, res) => {
  try {
    const { service, date, startTime } = req.query;
    if (!service || !date || !startTime) return res.status(400).json({ available: false });
    
    const serviceDoc = await Service.findOne({ title: service });
    if (!serviceDoc) return res.status(400).json({ available: false });
    
    const durationMin = parseDuration(serviceDoc.duration);
    const endTimeMin = addMinutes(parseTime(startTime), durationMin);
    
    if (endTimeMin > parseTime('18:00')) return res.json({ available: false });
    
    // Check overlapping bookings
    const bookings = await Booking.find({
      date,
      status: { $ne: 'Cancelled' }
    }).sort({ 'time': 1 });
    
    const startMin = parseTime(startTime);
    const endMin = endTimeMin;
    
    const overlap = bookings.some(b => {
      const bStart = parseTime(b.time);
      const bDuration = parseDuration(b.duration || '1 hr'); // Default if not stored
      const bEnd = addMinutes(bStart, bDuration);
      return startMin < bEnd && endMin > bStart;
    });
    
    res.json({ available: !overlap });
  } catch {
    res.status(500).json({ available: false });
  }
};



const createBooking = async (req, res) => {
  try {
    const { date, time, service, carType, phone } = req.body;

    if (!date || !time || !service || !carType || !phone) return res.status(400).json({ message: "All fields required: date, time, service, carType, phone" });

    const time24 = time; // Assume already 24h from frontend

    let user = null;
    let userName = 'Anonymous';
    let userEmail = '';
    if (req.user && req.user.id) {
      user = await User.findById(req.user.id).select('name email phone');
      if (user) {
        userName = user.name;
        userEmail = user.email;
      }
    }

    // Get service image
    const serviceDoc = await Service.findOne({ title: service });
    if (!serviceDoc) return res.status(400).json({ message: 'Service not found' });
    const serviceImage = serviceDoc.image;
    
    const durationMin = parseDuration(serviceDoc.duration);
    const slotEndMin = parseTime(time24) + durationMin;
    const slot_end = formatTime(slotEndMin);

    // Capacity check
    const bookedCount = await Booking.countDocuments({
      service_id: serviceDoc._id,
      date,
      time: time24
    });
    if (bookedCount >= serviceDoc.max_bookings_per_slot) {
      return res.status(400).json({ 
        message: `Slot full (${bookedCount}/${serviceDoc.max_bookings_per_slot} booked)` 
      });
    }

    const booking = await Booking.create({
      date, time: time24, service, carType, serviceImage, slot_end,
      service_id: serviceDoc._id,
      userName, userEmail, phone, user: user ? user._id : null
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, dateFrom, dateTo, service } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (service) {
      query.$or = [
        { service: { $regex: service, $options: 'i' } },
        { service_id: service }
      ];
    }
    if (dateFrom) {
      query.date = query.date || {};
      query.date.$gte = dateFrom;
    }
    if (dateTo) {
      query.date = query.date || {};
      query.date.$lte = dateTo;
    }
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('service_id', 'title duration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query)
    ]);

    res.json({
      bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ message: error.message });
  }
};


const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export for destructuring
module.exports = {
  getAvailableSlots,
  checkSlot,
  createBooking,
  getBookings,
  getUserBookings,
  updateBookingStatus,
  deleteBooking,
  editBooking
};

