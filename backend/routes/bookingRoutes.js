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

// User booking routes - specific paths MUST come before parameterized routes
router.post("/",                userAuth,     createBooking);
router.get("/check-slot",       userAuth,     checkSlot);
router.get("/my",               userAuth,     getUserBookings);
router.get("/:service_id/slots",userAuth,     getAvailableSlots);

// Admin booking routes
router.get("/",                 protectAdmin, getBookings);
router.put("/edit/:id",         protectAdmin, editBooking);
router.put("/:id",              protectAdmin, updateBookingStatus);
router.delete("/admin/:id",     protectAdmin, deleteBooking);

module.exports = router;
