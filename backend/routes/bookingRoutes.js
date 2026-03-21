const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  getUserBookings,
  updateBookingStatus,
  deleteBooking,
  editBooking,
  checkSlot,
  getAvailableSlots
} = require("../controllers/bookingController");

const { protectAdmin } = require("../middleware/authMiddleware");
const userAuth = require("../middleware/userAuth");

// User booking routes
router.post("/", userAuth, createBooking);
router.get("/check-slot", userAuth, checkSlot);
router.get("/:service_id/slots", userAuth, getAvailableSlots);
router.get("/my", userAuth, getUserBookings);
router.delete("/:id", userAuth, deleteBooking);

// Admin booking routes
router.get("/", protectAdmin, getBookings);
router.put("/:id", protectAdmin, updateBookingStatus);
router.put("/edit/:id", protectAdmin, editBooking);
router.delete("/admin/:id", protectAdmin, deleteBooking);

module.exports = router;
