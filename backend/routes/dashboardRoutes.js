const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

router.get("/", protectAdmin, getDashboardStats);

module.exports = router;
