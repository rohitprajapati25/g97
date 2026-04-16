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
    start_time: {
      type: String,
      default: '09:30'
    },
    end_time: {
      type: String,
      default: '19:00'
    },
    slot_interval: {
      type: Number,
      default: 30
    },
    max_bookings_per_slot: {
      type: Number,
      default: 1
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
