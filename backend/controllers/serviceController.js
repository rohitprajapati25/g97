const Service = require("../models/Service");
const cloudinary = require("../utils/cloudinary");
const cache = require("../utils/cache");

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url, folder) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    return `${folder}/${publicId}`;
  } catch (err) {
    return null;
  }
};

// Helper function to delete image from Cloudinary
const deleteCloudinaryImage = async (imageUrl, folder) => {
  if (!imageUrl) return;
  const publicId = extractPublicId(imageUrl, folder);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image: ${publicId}`);
    } catch (err) {
      console.error("Error deleting image from Cloudinary:", err.message);
    }
  }
};

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
      start_time: req.body.start_time || '09:30',
      end_time: req.body.end_time || '19:00',
      slot_interval: req.body.slot_interval ? parseInt(req.body.slot_interval) : 30,
      max_bookings_per_slot: req.body.max_bookings_per_slot ? parseInt(req.body.max_bookings_per_slot) : 1,
      image: uploadResult.secure_url, // ✅ Cloudinary URL
      isActive: true,
    });

    // Clear services cache after creating new service
    cache.flushAll();

    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Service creation failed" });
  }
};

// 📥 GET SERVICES
exports.getServices = async (req, res) => {
  try {
    const key = "services";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // cache full list to avoid repeated DB hits
    const cached = cache.get(key + `:${page}:${limit}`);
    if (cached) {
      return res.json(cached);
    }

    const [total, services] = await Promise.all([
      Service.countDocuments({ isActive: true }),
      Service.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const result = { total, page, limit, services };
    cache.set(key + `:${page}:${limit}`, result, 30); // short TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const { title, description, price, duration, start_time, end_time, slot_interval, max_bookings_per_slot } = req.body;
    let updateData = { title, description, price, duration };
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (slot_interval) updateData.slot_interval = parseInt(slot_interval);
    if (max_bookings_per_slot) updateData.max_bookings_per_slot = parseInt(max_bookings_per_slot);

    const existingService = await Service.findById(req.params.id);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Handle image update
    if (req.file && req.file.buffer) {
      // Delete old image from Cloudinary first
      if (existingService.image) {
        await deleteCloudinaryImage(existingService.image, "services");
      }
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "services" }
      );
      updateData.image = uploadResult.secure_url;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Clear services cache after update
    cache.flushAll();

    res.status(200).json({ success: true, service: updatedService });
  } catch (error) {
    console.error("Update Service Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};


// ❌ DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete image from Cloudinary
    await deleteCloudinaryImage(service.image, "services");

    await service.deleteOne();

    // Clear services cache after delete
    cache.flushAll();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete Service Error:", error);
    res.status(500).json({ message: error.message });
  }
};

