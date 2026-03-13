const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  otpCode: {
    type: String,
    required: true
  },
  otpExpires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes auto delete
  }
});

module.exports = mongoose.model("TempUser", tempUserSchema);

