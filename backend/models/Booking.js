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
    slot_end: {
      type: String
    },
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: "Pending",
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },

    serviceImage: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

  },
  { timestamps: true }
);

// Industry slot locking: 1 booking per service_id+date+time (regardless of user)
bookingSchema.index({ service_id: 1, date: 1, time: 1 }, { unique: true });
bookingSchema.index({ service: 1 }); // For title queries
// Per-user duplicate prevention
bookingSchema.index({ user: 1, date: 1, time: 1 });
bookingSchema.index({ date: 1, time: 1, service: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

