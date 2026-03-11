const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getUserBookings,
  updateBookingStatus,
  deleteBooking,
  editBooking,
} = require("../controllers/bookingController");

const { protectAdmin } = require("../middleware/authMiddleware");
const userAuth = require("../middleware/userAuth");

// User booking routes
router.post("/", userAuth, createBooking);
router.get("/my", userAuth, getUserBookings);
router.delete("/:id", userAuth, deleteBooking);

// Admin booking routes
router.get("/", protectAdmin, getBookings);
router.put("/:id", protectAdmin, updateBookingStatus);
router.put("/edit/:id", protectAdmin, editBooking);
router.delete("/admin/:id", protectAdmin, deleteBooking);

module.exports = router;

