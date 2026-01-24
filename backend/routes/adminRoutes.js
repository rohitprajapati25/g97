const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

router.post("/register", protectAdmin, registerAdmin);
router.post("/login", loginAdmin);


module.exports = router;
