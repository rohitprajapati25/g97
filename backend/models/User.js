const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    otpCode: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

// HASH PASSWORD before saving (Mongoose 9.x - no next() needed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
