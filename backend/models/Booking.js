const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    carType: {
      type: String,
      enum: ["Hatchback", "Sedan", "SUV", "Luxury"],
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
