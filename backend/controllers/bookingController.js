const Booking = require("../models/Booking");
const User = require("../models/User");
const Service = require("../models/Service");
const Notification = require("../models/Notification");
const { generateAvailableSlots } = require('../utils/slots');

// Define ALL functions first as local consts (hoisted)

const parseDuration = (durationStr) => {
  if (!durationStr) return 60;
  const match = durationStr.match(/(\d+)\s*(hrs?|hours?|min|minutes?)/i);
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
    
    // Use service's configured end time instead of hardcoded 19:00
    const serviceEndMin = parseTime(serviceDoc.end_time || '19:00');
    if (endTimeMin > serviceEndMin) return res.json({ available: false });
    
    // Check overlapping bookings
    const bookings = await Booking.find({
      date,
      status: { $ne: 'Cancelled' }
    }).sort({ 'time': 1 });
    
    const startMin = parseTime(startTime);
    const endMin = endTimeMin;
    
    const overlap = bookings.some(b => {
      const bStart = parseTime(b.time);
      const bDuration = parseDuration(b.duration || serviceDoc.duration || '1 hr');
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

    // ── Field presence check ───────────────────────────────────────────────
    if (!date || !time || !service || !carType || !phone) {
      return res.status(400).json({
        message: "All fields required: date, time, service, carType, phone",
      });
    }

    // ── Sanitize carType ───────────────────────────────────────────────────
    const sanitizedCarType = String(carType).trim().slice(0, 50);
    if (!sanitizedCarType) {
      return res.status(400).json({ message: "Vehicle type is required" });
    }

    // ── Date not in the past ───────────────────────────────────────────────
    // Parse date as local midnight (not UTC) to avoid timezone offset issues
    const [y, mo, d] = date.split('-').map(Number);
    const bookingDate = new Date(y, mo - 1, d); // local midnight
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // local midnight
    if (bookingDate < today) {
      return res.status(400).json({ message: "Cannot book a slot in the past" });
    }

    // ── Time format HH:MM ──────────────────────────────────────────────────
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM" });
    }

    // ── Phone validation ───────────────────────────────────────────────────
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: "Invalid phone number (min 10 digits)" });
    }

    // ── Resolve user ───────────────────────────────────────────────────────
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

    // ── Resolve service ────────────────────────────────────────────────────
    const serviceDoc = await Service.findOne({ title: service });
    if (!serviceDoc) {
      return res.status(400).json({ message: `Service "${service}" not found` });
    }
    if (!serviceDoc.isActive) {
      return res.status(400).json({ message: "This service is currently unavailable" });
    }

    const serviceImage = serviceDoc.image;
    const durationMin  = parseDuration(serviceDoc.duration);
    const slotEndMin   = parseTime(time) + durationMin;
    const slot_end     = formatTime(slotEndMin);

    // ── Slot within service hours ──────────────────────────────────────────
    const serviceEndMin = parseTime(serviceDoc.end_time || '19:00');
    if (slotEndMin > serviceEndMin) {
      return res.status(400).json({
        message: `Slot ends after studio closing time (${serviceDoc.end_time || '19:00'})`,
      });
    }

    // ── Capacity check ─────────────────────────────────────────────────────
    const bookedCount = await Booking.countDocuments({
      service_id: serviceDoc._id,
      date,
      time,
      status: { $ne: 'Cancelled' },
    });
    if (bookedCount >= serviceDoc.max_bookings_per_slot) {
      return res.status(400).json({
        message: `This slot is full (${bookedCount}/${serviceDoc.max_bookings_per_slot} booked). Please choose another time.`,
      });
    }

    // ── Duplicate booking for same user ────────────────────────────────────
    if (user) {
      const duplicate = await Booking.findOne({
        user: user._id,
        date,
        time,
        status: { $ne: 'Cancelled' },
      });
      if (duplicate) {
        return res.status(400).json({
          message: 'You already have a booking at this date and time',
        });
      }
    }

    // ── Create booking ─────────────────────────────────────────────────────
    const booking = await Booking.create({
      date,
      time,
      service,
      carType: sanitizedCarType,
      serviceImage,
      slot_end,
      duration:   serviceDoc.duration,
      service_id: serviceDoc._id,
      userName,
      userEmail,
      phone:      cleanPhone,
      user:       user ? user._id : null,
    });

    // ── Notify user of booking receipt ─────────────────────────────────────
    if (user) {
      const notification = await Notification.create({
        userId:    user._id,
        bookingId: booking._id,
        message:   `🕐 Booking received for "${service}" on ${date} at ${formatTime(parseTime(time))}. We'll confirm shortly!`,
        type:      'info',
      });
      if (req.app.get('io')) {
        req.app.get('io').to(user._id.toString()).emit('notification', notification);
      }
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message || 'Booking failed. Please try again.' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ date: -1, time: -1 })
      .lean();
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, dateFrom, dateTo, service } = req.query;
    const query = {};

    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = dateFrom;
      if (dateTo)   query.date.$lte = dateTo;
    }

    // Service filter (separate from search to avoid $or collision)
    if (service && !search) {
      query.$or = [
        { service: { $regex: service, $options: 'i' } },
      ];
    }

    // Search filter — overrides service filter if both provided
    if (search) {
      query.$or = [
        { userName:  { $regex: search, $options: 'i' } },
        { phone:     { $regex: search, $options: 'i' } },
        { service:   { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('service_id', 'title duration price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query),
    ]);

    res.json({
      bookings,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ message: error.message });
  }
};


const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Create notification for user if booking has a user
    if (booking.user) {
      const msgMap = {
        Confirmed: `✅ Your booking for "${booking.service}" on ${booking.date} at ${booking.time} has been confirmed!`,
        Cancelled: `❌ Your booking for "${booking.service}" on ${booking.date} at ${booking.time} has been cancelled.`,
        Completed: `🎉 Your "${booking.service}" service on ${booking.date} is marked as completed. Thank you!`,
        Pending: `🕐 Your booking for "${booking.service}" is pending review.`,
      };
      const message = msgMap[status] || `Your booking status has been updated to: ${status}`;

      const notification = await Notification.create({
        userId: booking.user,
        bookingId: booking._id,
        adminId: req.admin?._id,
        message,
        type: status === 'Confirmed' ? 'approved'
            : status === 'Cancelled' ? 'rejected'
            : status === 'Completed' ? 'approved'
            : 'info',
      });

      // Emit real-time notification via Socket.IO
      if (req.app.get('io')) {
        req.app.get('io').to(booking.user.toString()).emit('notification', notification);
      }
    }

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
    const { date, time, service, carType, userName, phone, status } = req.body;

    // Build a safe update object — only allow known fields
    const update = {};
    if (date)     update.date     = date;
    if (time)     update.time     = time;
    if (service)  update.service  = service;
    if (carType)  update.carType  = String(carType).trim().slice(0, 50);
    if (userName) update.userName = String(userName).trim();
    if (phone)    update.phone    = String(phone).replace(/\D/g, '');
    if (status && ['Pending','Confirmed','Completed','Cancelled'].includes(status)) {
      update.status = status;
    }

    // Validate date not in past if being changed
    if (date) {
      const [y, mo, d] = date.split('-').map(Number);
      const bookingDate = new Date(y, mo - 1, d);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        return res.status(400).json({ message: 'Cannot set booking date in the past' });
      }
    }

    // Validate time format if being changed
    if (time && !/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

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

