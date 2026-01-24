const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getUserBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const { protectAdmin } = require("../middleware/authMiddleware");
const userAuth = require("../middleware/userAuth");

// User booking routes
router.post("/", userAuth, createBooking);
router.get("/my", userAuth, getUserBookings);

// Admin booking routes
router.get("/", protectAdmin, getBookings);
router.put("/:id", protectAdmin, updateBookingStatus);

module.exports = router;

