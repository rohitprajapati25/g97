const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
  try {
    const [services, bookings, products, recentBookings] = await Promise.all([
      Service.countDocuments(),
      Booking.countDocuments(),
      Product.countDocuments(),
      Booking.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Format recent bookings for frontend
    const formattedRecentBookings = recentBookings.map(booking => ({
      _id: booking._id,
      userName: booking.userName,
      phone: booking.phone,
      service: booking.service,
      carType: booking.carType,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      userEmail: booking.user?.email || "N/A",
      createdAt: booking.createdAt
    }));

    res.json({
      services,
      bookings,
      products,
      recentBookings: formattedRecentBookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
