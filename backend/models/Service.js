const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Cloudinary URL
    },
    imagePublicId: {
      type: String, // Cloudinary public_id
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceSchema.index({ title: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model("Service", serviceSchema);
