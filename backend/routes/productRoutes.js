const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

const {
  createProduct,
  getProducts,
  updateProduct, // 🔥 Naya controller function import karein
  deleteProduct,
} = require("../controllers/productController");

// 📥 Public Route
router.get("/", getProducts);

/* ===============================
    🛠️ ADMIN ONLY ROUTES
================================ */

// ➕ Create Product
router.post(
  "/",
  protectAdmin,
  upload.single("image"), 
  createProduct
);

// 🔄 Update Product (Edit)
router.put(
  "/:id", 
  protectAdmin, 
  upload.single("image"), // 🔥 Image update handle karne ke liye
  updateProduct
);

// ❌ Delete Product
router.delete("/:id", protectAdmin, deleteProduct);

module.exports = router;