const Booking = require("../models/Booking");
const User = require("../models/User");

// Helper function to convert 12-hour time to 24-hour format for storage
const convertTo24Hour = (time12h) => {
  if (!time12h) return time12h;
  
  // If already in 24-hour format, return as-is
  if (time12h.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    return time12h;
  }
  
  const [time, modifier] = time12h.split(/(?=[AP]M)/i);
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier.toUpperCase() === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours}:${minutes}`;
};

// Helper function to convert 24-hour time to 12-hour format for display
const convertTo12Hour = (time24) => {
  if (!time24) return time24;
  
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

// ➕ Create Booking (User)
exports.createBooking = async (req, res) => {
  try {
    const { date, time, service, carType } = req.body;

    // Get user details from the logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate required fields
    if (!date || !time || !service || !carType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate date: must be today or future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    if (bookingDate < today) {
      return res.status(400).json({ message: "Booking date cannot be in the past" });
    }

    // Validate and convert time: must be between 9 AM and 6 PM
    const time24 = convertTo24Hour(time);
    const [hours, minutes] = time24.split(':').map(Number);
    const bookingTime = hours * 60 + minutes; // Convert to minutes
    const startTime = 9 * 60; // 9 AM
    const endTime = 18 * 60; // 6 PM
    if (bookingTime < startTime || bookingTime > endTime) {
      return res.status(400).json({ message: "Booking time must be between 9 AM and 6 PM" });
    }

    // Check for duplicate booking: same user, same date, same time
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      date: date,
      time: time24,
    });
    if (existingBooking) {
      return res.status(400).json({ message: "You already have a booking at this date and time" });
    }

    // Create booking with user details from profile
    const booking = await Booking.create({
      date: date,
      time: time24,
      service: service,
      carType: carType,
      userName: user.name, // Get name from user profile
      phone: user.phone || "Not Provided", // Get phone from user profile
      user: req.user.id, // Link to logged in user
    });
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 📥 Get My Bookings (User)
exports.getUserBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [total, bookings] = await Promise.all([
      Booking.countDocuments({ user: req.user.id }),
      Booking.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({ total, page, limit, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get All Bookings (Admin) - with search/filter
exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    
    // Search by user name or phone
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { userName: searchRegex },
        { phone: searchRegex },
        { service: searchRegex }
      ];
    }
    
    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      };
    } else if (req.query.date) {
      filter.date = req.query.date;
    }

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Add user email from populated user profile
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      userEmail: booking.user?.email || "N/A"
    }));

    res.json({ total, page, limit, bookings: formattedBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Edit Booking (Admin)
exports.editBooking = async (req, res) => {
  try {
    const { date, time, service, carType, userName, phone, status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update fields if provided
    if (date) booking.date = date;
    if (time) booking.time = time;
    if (service) booking.service = service;
    if (carType) booking.carType = carType;
    if (userName) booking.userName = userName;
    if (phone) booking.phone = phone;
    if (status) booking.status = status;

    await booking.save();
    
    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔄 Update Booking Status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ DELETE/CANCEL BOOKING (User or Admin)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is either the booking owner or an admin
    // Note: For user deletions, we need to check user ownership
    // For admin, they can delete any booking
    if (req.user && req.user.role === "user" && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this booking" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

