const express = require("express");
const router = express.Router();

const Service = require("../models/Service");
const Product = require("../models/Product");
const Booking = require("../models/Booking");

const { protectAdmin } = require("../middleware/authMiddleware");

router.get("/", protectAdmin, async (req, res) => {

  try {
    const services = await Service.countDocuments();
    const products = await Product.countDocuments();
    const bookings = await Booking.countDocuments();

    res.json({
      services,
      products,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error" });
  }
});

module.exports = router;
