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

// Public route
router.get("/", getServices);

// Admin routes
router.post("/", protectAdmin, upload.single("image"), createService);

// Edit mein bhi image upload handle karna hai
router.put("/:id", protectAdmin, upload.single("image"), updateService);

router.delete("/:id", protectAdmin, deleteService);

module.exports = router;