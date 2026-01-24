const Booking = require("../models/Booking");

// ➕ Create Booking (User)
exports.createBooking = async (req, res) => {
  try {
    const { date, time, service, carType, userName, phone } = req.body;

    // Validate required fields
    if (!date || !time || !service || !carType || !userName || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate date: must be today or future
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    if (bookingDate < today) {
      return res.status(400).json({ message: "Booking date cannot be in the past" });
    }

    // Validate time: must be between 9 AM and 6 PM
    const [hours, minutes] = time.split(':').map(Number);
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
      time: time,
    });
    if (existingBooking) {
      return res.status(400).json({ message: "You already have a booking at this date and time" });
    }

    // Create booking if all validations pass
    const booking = await Booking.create({
      ...req.body,
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
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get All Bookings (Admin)
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

