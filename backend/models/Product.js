const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// name lookup index
productSchema.index({ name: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
