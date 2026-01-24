const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
  try {
    const services = await Service.countDocuments();
    const bookings = await Booking.countDocuments();
    const products = await Product.countDocuments();

    res.json({
      services,
      bookings,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
