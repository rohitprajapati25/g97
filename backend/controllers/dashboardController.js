const Service = require("../models/Service");
const Booking = require("../models/Booking");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
  try {
    // ── Basic counts ──────────────────────────────────────────────────────────
    const [services, bookings, products, recentBookings] = await Promise.all([
      Service.countDocuments(),
      Booking.countDocuments(),
      Product.countDocuments(),
      Booking.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // ── Bookings last 7 days (daily trend) ────────────────────────────────────
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRaw = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo, $lte: today } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0
    const dailyMap = {};
    dailyRaw.forEach((d) => { dailyMap[d._id] = d.count; });
    const dailyBookings = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
      dailyBookings.push({ date: key, label, count: dailyMap[key] || 0 });
    }

    // ── Bookings by status ────────────────────────────────────────────────────
    const statusRaw = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusData = statusRaw.map((s) => ({ name: s._id || "Unknown", value: s.count }));

    // ── Bookings by service (top 6) ───────────────────────────────────────────
    const serviceRaw = await Booking.aggregate([
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);
    const serviceData = serviceRaw.map((s) => ({ name: s._id || "Unknown", bookings: s.count }));

    // ── Revenue estimate (sum of service prices for Completed bookings) ───────
    const completedBookings = await Booking.countDocuments({ status: "Completed" });
    const pendingBookings   = await Booking.countDocuments({ status: "Pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "Confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "Cancelled" });

    // ── Format recent bookings ────────────────────────────────────────────────
    const formattedRecentBookings = recentBookings.map((booking) => ({
      _id: booking._id,
      userName: booking.userName,
      phone: booking.phone,
      service: booking.service,
      carType: booking.carType,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      userEmail: booking.user?.email || "N/A",
      createdAt: booking.createdAt,
    }));

    res.json({
      services,
      bookings,
      products,
      completedBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      recentBookings: formattedRecentBookings,
      dailyBookings,
      statusData,
      serviceData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};
