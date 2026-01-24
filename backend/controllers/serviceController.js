const Service = require("../models/Service");
const cloudinary = require("../utils/cloudinary");

// ➕ ADD SERVICE (ADMIN)
exports.createService = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // 🔥 Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "services",
      }
    );

    const service = await Service.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      duration: req.body.duration,
      image: uploadResult.secure_url, // ✅ Cloudinary URL
      isActive: true,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Service creation failed" });
  }
};

// 📥 GET SERVICES
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await service.deleteOne();
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
