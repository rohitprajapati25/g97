const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, generate2FA, verify2FA, getProfile, updateProfile, changePassword } = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// two factor endpoints (must be logged in already)
router.get("/2fa/setup", protectAdmin, generate2FA);
router.post("/2fa/verify", protectAdmin, verify2FA);

// profile data for frontend
router.get("/me", protectAdmin, getProfile);

// update profile
router.put("/profile", protectAdmin, updateProfile);

// change password
router.put("/password", protectAdmin, changePassword);


module.exports = router;
