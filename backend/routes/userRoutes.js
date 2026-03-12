const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  getProfile
} = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.get("/profile", userAuth, getProfile);

module.exports = router;
