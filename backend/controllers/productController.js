const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");

/* ===============================
   ➕ CREATE PRODUCT (ADMIN)
================================ */
exports.createProduct = async (req, res) => {
  try {
    console.log("BODY 👉", req.body);
    console.log("FILE 👉", req.file);

    const { name, price, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name & price required" });
    }

    let imageUrl = "";

    // ✅ IMAGE UPLOAD (IMPORTANT FIX)
    if (req.file && req.file.buffer) {
      const uploadRes = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "products",
        }
      );

      imageUrl = uploadRes.secure_url;
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      description: description || "",
      image: imageUrl, // 🔥 THIS WILL SHOW IN UI
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR ❌", err);
    res.status(500).json({ message: "Product create failed" });
  }
};

/* ===============================
   📥 GET ALL PRODUCTS
================================ */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ===============================
   ❌ DELETE PRODUCT
================================ */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
