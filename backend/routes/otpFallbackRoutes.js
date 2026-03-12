const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpFallbackController");

// Secret admin route for production OTP check
router.post("/check", otpController.checkOTP);
router.post("/admin-generate", otpController.adminCheckOTP);

module.exports = router;

