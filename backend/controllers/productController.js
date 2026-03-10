const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");
const cache = require("../utils/cache");

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
    // implement simple pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const key = `products:${page}:${limit}`;
    const cached = cache.get(key);
    if (cached) {
      return res.json(cached);
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(),
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const result = { total, page, limit, products };
    cache.set(key, result, 30);
    res.json(result);
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

/* ===============================
    🔄 UPDATE PRODUCT (ADMIN)
================================ */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    // 1. Check if product exists
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Prepare Update Object
    const updateData = {
      name: name ? name.trim() : product.name,
      price: price ? Number(price) : product.price,
      description: description !== undefined ? description : product.description,
    };

    // 3. Handle Image Update (If new file is provided)
    if (req.file && req.file.buffer) {
      // Naya image upload logic (Base64)
      const uploadRes = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "products",
        }
      );
      updateData.image = uploadRes.secure_url;
    }

    // 4. Update Database
    product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // 5. Clear Cache (Taki updated data turant dikhe)
    // cache.flushAll(); // Agar aapka cache utility support karta hai toh sab uda do
    // Ya specific key clear karein

    res.status(200).json(product);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR ❌", err);
    res.status(500).json({ message: "Update failed" });
  }
};