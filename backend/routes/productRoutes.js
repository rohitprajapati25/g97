const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const {
  createProduct,
  getProducts,
  deleteProduct,
} = require("../controllers/productController");

// Public
router.get("/", getProducts);

// Admin
router.post(
  "/",
  protectAdmin,
  upload.single("image"), // 🔥 THIS WAS MISSING
  createProduct
);

router.delete("/:id", protectAdmin, deleteProduct);

module.exports = router;
