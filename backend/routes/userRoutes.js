const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyUserOTP } = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/verify-otp", verifyUserOTP);
router.post("/login", loginUser);

module.exports = router;
