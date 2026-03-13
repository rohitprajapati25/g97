const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");

router.post("/register", userController.registerUser);
router.post("/verify-otp", userController.verifyOTP);
// router.post("/resend-otp", userController.resendOTP); // Removed
router.post("/login", userController.loginUser);
router.get("/profile", userAuth, userController.getProfile);

module.exports = router;

