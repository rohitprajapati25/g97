const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { protectAdmin } = require("../middleware/authMiddleware");

const {
  createService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// 📥 Get Services (Public)
router.get("/", getServices);

// ADMIN ONLY ROUTES
router.post("/", protectAdmin, upload.single("image"), createService);
router.put("/:id", protectAdmin, updateService);
router.delete("/:id", protectAdmin, deleteService);

module.exports = router;

